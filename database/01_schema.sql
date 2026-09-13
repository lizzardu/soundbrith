-- ============================================================================
-- SOUNDBIRTH — Esquema da base de dados (Supabase / PostgreSQL)
-- CREIC · Centro de Referência de Implante Coclear · ULS São José
--
-- Ordem de execução no SQL Editor do Supabase (cada ficheiro inteiro → Run):
--   01_schema.sql          ← este: tabelas, funções, regras de acesso (RLS)
--   02_catalogo.sql        etapas das duas jornadas e catálogo de questionários
--   03_primeiro_profissional.sql   dá acesso de profissional a uma conta
--   04_dados_demo.sql      (opcional) doentes fictícios para testar
--
-- Modelo de acesso: só há DOIS papéis.
--   profissional  vê e gere todos os doentes do centro
--   utilizador    vê apenas o seu doente — o próprio adulto, ou os pais /
--                 cuidador de uma criança
-- O profissional escolhe o GRUPO (adulto ou pediátrico) ao criar o doente.
-- É o grupo que decide que área o utilizador vê ao entrar.
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;


-- ============================================================================
-- 1. DOENTES
-- ============================================================================
create table doentes (
  id                  uuid primary key default gen_random_uuid(),
  processo            text not null unique,
  nome                text not null,
  data_nascimento     date,
  grupo               text not null check (grupo in ('adulto','pediatrico')),
  sexo                text check (sexo in ('F','M','outro')),
  lado_implante       text not null default 'nenhum'
                      check (lado_implante in ('direito','esquerdo','bilateral','nenhum')),
  etiologia           text,
  data_referenciacao  date,
  data_ativacao       date,          -- a partir daqui conta a idade auditiva
  responsaveis        text,          -- pediatria: quem tem responsabilidades parentais
  gestor_caso         text,
  estado              text not null default 'ativo'
                      check (estado in ('ativo','alta','abandono','transferido')),
  notas               text,
  criado_por          uuid references auth.users(id) on delete set null,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now()
);

comment on column doentes.grupo is
  'Escolhido pelo profissional ao criar o doente. Define a jornada e a área que o utilizador vê. Não é deduzido da idade: a passagem de pediátrico a adulto é uma decisão clínica.';


-- ============================================================================
-- 2. PERFIS — liga cada conta de login (auth.users) a um dos dois papéis
-- ============================================================================
create table perfis (
  id              uuid primary key references auth.users(id) on delete cascade,
  papel           text not null check (papel in ('utilizador','profissional')),
  nome            text not null,
  especialidade   text,                                        -- profissional
  doente_id       uuid references doentes(id) on delete cascade, -- utilizador
  relacao         text check (relacao in ('proprio','mae','pai','tutor','outro')),
  criado_em       timestamptz not null default now(),
  constraint perfil_utilizador_tem_doente
    check ((papel = 'utilizador') = (doente_id is not null))
);

comment on table perfis is
  'Um registo por conta. Um doente pode ter várias contas de utilizador (mãe e pai de uma criança, por exemplo), todas ligadas ao mesmo doente_id.';


-- ============================================================================
-- 3. FUNÇÕES AUXILIARES DE ACESSO (usadas pelas regras RLS)
-- ============================================================================
create or replace function is_profissional() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfis where id = auth.uid() and papel = 'profissional');
$$;

create or replace function meu_doente_id() returns uuid
language sql stable security definer set search_path = public as $$
  select doente_id from perfis where id = auth.uid() and papel = 'utilizador';
$$;

-- pode ver/escrever dados deste doente?
create or replace function acesso_doente(p_doente uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select is_profissional() or p_doente = meu_doente_id();
$$;


-- ============================================================================
-- 4. PREFERÊNCIAS DE COMUNICAÇÃO
--    Tabela própria: é consultada por marcações, mensagens e alertas.
--    Sem ela, a plataforma telefona a quem não ouve.
-- ============================================================================
create table preferencias_comunicacao (
  doente_id           uuid primary key references doentes(id) on delete cascade,
  canais              text[] not null default '{plataforma}',  -- plataforma, sms, email, video_legendado, video_lgp
  canais_proibidos    text[] not null default '{}',            -- chamada_telefonica
  usa_lgp             boolean not null default false,
  precisa_interprete  boolean not null default false,
  leitura_labial      boolean not null default false,
  linguagem_simples   boolean not null default false,
  notas               text,
  atualizado_em       timestamptz not null default now()
);


-- ============================================================================
-- 5. JORNADA — modelo de etapas (por grupo) e percurso de cada doente
-- ============================================================================
create table etapas_modelo (
  id           text primary key,          -- 'a_ref', 'p_rastreio', ...
  grupo        text not null check (grupo in ('adulto','pediatrico')),
  fase         text not null,
  fase_curta   text not null,
  fase_ordem   int  not null,
  ordem        int  not null,
  titulo       text not null,
  titulo_simples text,                    -- versão em linguagem clara para o utilizador
  quem         text,
  prazo_texto  text,
  prazo_dias   int,                        -- alimenta o alerta de etapa parada
  nota         text,
  evidencia    text                        -- porque existe esta etapa (referência)
);

create table jornada_doente (
  id             uuid primary key default gen_random_uuid(),
  doente_id      uuid not null references doentes(id) on delete cascade,
  etapa_id       text not null references etapas_modelo(id),
  estado         text not null default 'previsto'
                 check (estado in ('previsto','ativo','feito','nao_aplicavel')),
  iniciada_em    timestamptz,             -- quando passou a ativa (para medir atrasos)
  data_prevista  date,
  data_efetiva   date,
  observacoes    text,
  atualizado_por uuid references auth.users(id) on delete set null,
  atualizado_em  timestamptz not null default now(),
  unique (doente_id, etapa_id)
);

create index on jornada_doente (doente_id);


-- ============================================================================
-- 6. CONVITES — ativação da conta do utilizador por código de uso único
--    O código só existe em claro no momento em que é criado; na base de
--    dados fica apenas o hash.
-- ============================================================================
create table convites (
  id            uuid primary key default gen_random_uuid(),
  doente_id     uuid not null references doentes(id) on delete cascade,
  email         text not null,
  nome_titular  text not null,
  relacao       text not null check (relacao in ('proprio','mae','pai','tutor','outro')),
  codigo_hash   text not null,
  expira_em     timestamptz not null,
  usado_em      timestamptz,
  user_id       uuid references auth.users(id) on delete set null,
  criado_por    uuid references auth.users(id) on delete set null,
  criado_em     timestamptz not null default now()
);


-- ============================================================================
-- 7. MARCAÇÕES — incluindo pedidos feitos pelo próprio utilizador
-- ============================================================================
create table marcacoes (
  id               uuid primary key default gen_random_uuid(),
  doente_id        uuid not null references doentes(id) on delete cascade,
  quando           timestamptz,
  tipo             text not null,
  local            text,
  profissional     text,
  estado           text not null default 'marcada'
                   check (estado in ('pedido','marcada','confirmada','realizada','faltou','cancelada')),
  origem           text not null default 'equipa' check (origem in ('equipa','utilizador')),
  motivo           text,                  -- preenchido nos pedidos do utilizador
  apoio_pedido     text[] not null default '{}',  -- interprete_lgp, interprete_video, transcricao, acompanhante
  apoio_garantido  boolean not null default false,
  criado_por       uuid references auth.users(id) on delete set null,
  criado_em        timestamptz not null default now()
);

create index on marcacoes (doente_id, quando);


-- ============================================================================
-- 8. MENSAGENS — o canal escrito entre utilizador e equipa
-- ============================================================================
create table mensagens (
  id                  uuid primary key default gen_random_uuid(),
  doente_id           uuid not null references doentes(id) on delete cascade,
  autor_id            uuid references auth.users(id) on delete set null,
  autor_nome          text not null,
  papel_autor         text not null check (papel_autor in ('utilizador','profissional')),
  texto               text not null check (length(trim(texto)) > 0),
  urgente             boolean not null default false,
  lida_equipa_em      timestamptz,
  lida_utilizador_em  timestamptz,
  criado_em           timestamptz not null default now()
);

create index on mensagens (doente_id, criado_em);


-- ============================================================================
-- 9. QUESTIONÁRIOS (PROMs, PREMs e expectativas)
-- ============================================================================
create table questionarios (
  id             text primary key,        -- 'ciqol10', 'ssq12', 'littlears', ...
  sigla          text not null,
  nome           text not null,
  tipo           text not null check (tipo in ('prom','prem','expectativas')),
  grupo          text not null check (grupo in ('adulto','pediatrico','ambos')),
  idade_min      int,                     -- anos (ou meses de idade auditiva, ver notas)
  idade_max      int,
  respondente    text not null
                 check (respondente in ('proprio','cuidador','crianca_apoio','professor')),
  nucleo         boolean not null default false,
  itens_n        int,
  minutos        int,
  momentos       text[] not null default '{}',
  dominios_icf   text[] not null default '{}',  -- funcoes_corpo, atividades_participacao, fatores_ambientais
  licenca        text,
  versao_pt      text,
  mcid           numeric,                 -- diferença mínima clinicamente relevante, se conhecida
  normas         jsonb,                   -- valores normativos por domínio, se conhecidos
  definicao      jsonb,                   -- escala, itens e método de pontuação do formulário
  notas          text,
  ativo          boolean not null default true
);

create table pedidos_questionario (
  id               uuid primary key default gen_random_uuid(),
  doente_id        uuid not null references doentes(id) on delete cascade,
  questionario_id  text not null references questionarios(id),
  momento          text not null,
  respondente      text not null
                   check (respondente in ('proprio','cuidador','crianca_apoio','professor')),
  prazo            date,
  estado           text not null default 'pendente'
                   check (estado in ('pendente','respondido','expirado','cancelado')),
  enviado_por      uuid references auth.users(id) on delete set null,
  enviado_em       timestamptz not null default now(),
  respondido_em    timestamptz
);

create index on pedidos_questionario (doente_id, estado);

create table respostas_questionario (
  id                    uuid primary key default gen_random_uuid(),
  pedido_id             uuid references pedidos_questionario(id) on delete set null,
  doente_id             uuid not null references doentes(id) on delete cascade,
  questionario_id       text not null references questionarios(id),
  momento               text not null,
  -- quem respondeu faz parte do dado: proxy e autorreporte não se comparam
  papel_respondente     text not null
                        check (papel_respondente in ('proprio','cuidador','crianca_apoio','professor','clinico')),
  respondido_por        uuid references auth.users(id) on delete set null,
  idade_meses           int,
  idade_auditiva_meses  int,
  respostas             jsonb,            -- item → valor
  pontuacao             numeric,          -- pontuação global
  subescalas            jsonb,            -- domínio → pontuação
  criado_em             timestamptz not null default now()
);

create index on respostas_questionario (doente_id, questionario_id, criado_em);


-- ============================================================================
-- 10. AUDIOLOGIA, PROGRAMAÇÕES E DISPOSITIVOS
-- ============================================================================
create table avaliacoes_audiologicas (
  id              uuid primary key default gen_random_uuid(),
  doente_id       uuid not null references doentes(id) on delete cascade,
  data            date not null default current_date,
  momento         text not null,          -- basal, com_protese, ativacao, 1m, 3m, 6m, 12m, anual, upgrade_pre, upgrade_pos
  condicao        text,                   -- campo_livre_protese, campo_livre_implante, ...
  tonal           jsonb,                  -- {"250":75, "500":80, ...} em dB HL
  vocal_silencio  numeric,                -- % de acerto
  vocal_ruido     numeric,                -- % de acerto
  srt_ruido_db    numeric,                -- limiar de receção da fala no ruído (dB S/R)
  teste           text,
  notas           text,
  criado_por      uuid references auth.users(id) on delete set null,
  criado_em       timestamptz not null default now()
);

create table programacoes (
  id              uuid primary key default gen_random_uuid(),
  doente_id       uuid not null references doentes(id) on delete cascade,
  data            date not null default current_date,
  sessao          text,                   -- ativacao, 1sem, 1m, 3m, 6m, 12m, extra
  lado            text,
  uso_medio_h     numeric check (uso_medio_h is null or uso_medio_h between 0 and 24),
  estrategia      text,
  canais_ativos   int,
  impedancias     text,
  queixas         text,
  plano           text,
  criado_por      uuid references auth.users(id) on delete set null,
  criado_em       timestamptz not null default now()
);

create table processadores (
  id              uuid primary key default gen_random_uuid(),
  doente_id       uuid not null references doentes(id) on delete cascade,
  lado            text,
  modelo          text,
  entregue_em     date not null,
  substituido_em  date,
  motivo          text,
  criado_em       timestamptz not null default now()
);


-- ============================================================================
-- 11. REABILITAÇÃO
-- ============================================================================
create table exercicios (
  id             uuid primary key default gen_random_uuid(),
  doente_id      uuid not null references doentes(id) on delete cascade,
  titulo         text not null,
  frequencia     text,
  alvo_semanal   int not null default 7 check (alvo_semanal between 1 and 21),
  instrucoes     text,
  ativo          boolean not null default true,
  criado_por     uuid references auth.users(id) on delete set null,
  criado_em      timestamptz not null default now()
);

create table registos_exercicio (
  id            uuid primary key default gen_random_uuid(),
  exercicio_id  uuid not null references exercicios(id) on delete cascade,
  doente_id     uuid not null references doentes(id) on delete cascade,
  data          date not null default current_date,
  registado_por uuid references auth.users(id) on delete set null,
  unique (exercicio_id, data)
);

create table diario (
  id                 uuid primary key default gen_random_uuid(),
  doente_id          uuid not null references doentes(id) on delete cascade,
  texto              text,
  como_correu        int check (como_correu between 1 and 5),
  tirou_processador  text,                -- pediatria: 'nao', 'poucas', 'varias'
  autor_id           uuid references auth.users(id) on delete set null,
  criado_em          timestamptz not null default now()
);

create table marcos_linguagem (
  id                         uuid primary key default gen_random_uuid(),
  doente_id                  uuid not null references doentes(id) on delete cascade,
  marco                      text not null,
  idade_auditiva_alvo_meses  int,
  atingido_em                date,
  confirmado_por             uuid references auth.users(id) on delete set null,
  criado_em                  timestamptz not null default now()
);


-- ============================================================================
-- 12. RESULTADOS SOCIAIS — emprego e escolaridade
--     A análise custo-benefício de Neve et al. (2021) mostra que, em crianças
--     e adultos em idade ativa, o benefício social do implante vem sobretudo
--     da escolaridade e da produtividade. Sem registar estes dados, esse
--     benefício não aparece em lado nenhum.
-- ============================================================================
create table resultados_sociais (
  id                    uuid primary key default gen_random_uuid(),
  doente_id             uuid not null references doentes(id) on delete cascade,
  data                  date not null default current_date,
  situacao_profissional text check (situacao_profissional in
    ('tempo_inteiro','tempo_parcial','desempregado','baixa','reformado','estudante','outra')),
  escolaridade          text check (escolaridade in
    ('creche','pre_escolar','regular_sem_apoio','regular_com_apoio','bilingue','especial','superior','nao_aplicavel')),
  notas                 text,
  registado_por         uuid references auth.users(id) on delete set null,
  criado_em             timestamptz not null default now()
);


-- ============================================================================
-- 13. DECISÃO DE CANDIDATURA (reunião multidisciplinar)
-- ============================================================================
create table decisoes_candidatura (
  id              uuid primary key default gen_random_uuid(),
  doente_id       uuid not null references doentes(id) on delete cascade,
  data_reuniao    date not null default current_date,
  decisao         text not null check (decisao in ('candidato','nao_candidato','adiar','rever')),
  lado_proposto   text,
  fundamentacao   text,
  pendentes       text,
  registado_por   uuid references auth.users(id) on delete set null,
  criado_em       timestamptz not null default now()
);


-- ============================================================================
-- 14. ALERTAS TRATADOS E AUDITORIA
-- ============================================================================
create table alertas_tratados (
  chave        text primary key,          -- regra:id — ver vista v_alertas
  doente_id    uuid references doentes(id) on delete cascade,
  nota         text,
  tratado_por  uuid references auth.users(id) on delete set null,
  tratado_em   timestamptz not null default now()
);

create table auditoria (
  id          bigint generated always as identity primary key,
  tabela      text not null,
  operacao    text not null,
  registo_id  text,
  utilizador  uuid,
  quando      timestamptz not null default now()
);


-- ============================================================================
-- 15. GATILHOS
-- ============================================================================

-- 15.1 carimbo de atualização
create or replace function tocar_atualizado_em() returns trigger
language plpgsql as $$
begin
  new.atualizado_em := now();
  return new;
end $$;

create trigger doentes_atualizado before update on doentes
  for each row execute function tocar_atualizado_em();
create trigger preferencias_atualizado before update on preferencias_comunicacao
  for each row execute function tocar_atualizado_em();

-- 15.2 ao criar o doente (ou mudar de grupo), cria as etapas da jornada do grupo
create or replace function criar_jornada_do_grupo() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_primeira text;
begin
  if tg_op = 'UPDATE' and new.grupo = old.grupo then
    return new;
  end if;

  insert into jornada_doente (doente_id, etapa_id)
  select new.id, e.id from etapas_modelo e where e.grupo = new.grupo
  on conflict (doente_id, etapa_id) do nothing;

  -- se não há etapa ativa no grupo, ativa a primeira que ainda não está feita
  if not exists (
    select 1 from jornada_doente j join etapas_modelo e on e.id = j.etapa_id
    where j.doente_id = new.id and e.grupo = new.grupo and j.estado = 'ativo'
  ) then
    select e.id into v_primeira
    from jornada_doente j join etapas_modelo e on e.id = j.etapa_id
    where j.doente_id = new.id and e.grupo = new.grupo and j.estado = 'previsto'
    order by e.fase_ordem, e.ordem limit 1;

    if v_primeira is not null then
      update jornada_doente set estado = 'ativo'
      where doente_id = new.id and etapa_id = v_primeira;
    end if;
  end if;

  return new;
end $$;

create trigger doentes_criar_jornada after insert or update of grupo on doentes
  for each row execute function criar_jornada_do_grupo();

-- 15.3 regista quando a etapa começou e quando terminou
create or replace function jornada_carimbos() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    if new.estado = 'ativo' then
      new.iniciada_em := coalesce(new.iniciada_em, now());
    end if;
  elsif new.estado = 'ativo' and old.estado is distinct from 'ativo'
        and new.iniciada_em is not distinct from old.iniciada_em then
    -- reativar uma etapa volta a contar o prazo do zero
    -- (a não ser que a atualização traga ela própria uma data de início)
    new.iniciada_em := now();
  end if;
  if new.estado = 'feito' and new.data_efetiva is null then
    new.data_efetiva := current_date;
  end if;
  new.atualizado_por := coalesce(auth.uid(), new.atualizado_por);
  new.atualizado_em := now();
  return new;
end $$;

create trigger jornada_antes before insert or update on jornada_doente
  for each row execute function jornada_carimbos();

-- 15.4 ao concluir uma etapa, ativa a seguinte se não houver outra em curso.
--      Pode ser desligado numa transação com: set local creic.sem_avanco = 'on'
create or replace function jornada_avancar() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_grupo   text;
  v_seguinte text;
begin
  if new.estado <> 'feito' or old.estado = 'feito' then return new; end if;
  if coalesce(current_setting('creic.sem_avanco', true), '') = 'on' then return new; end if;

  select grupo into v_grupo from doentes where id = new.doente_id;

  if exists (
    select 1 from jornada_doente j join etapas_modelo e on e.id = j.etapa_id
    where j.doente_id = new.doente_id and e.grupo = v_grupo and j.estado = 'ativo'
  ) then
    return new;
  end if;

  select e.id into v_seguinte
  from jornada_doente j join etapas_modelo e on e.id = j.etapa_id
  where j.doente_id = new.doente_id and e.grupo = v_grupo and j.estado = 'previsto'
  order by e.fase_ordem, e.ordem limit 1;

  if v_seguinte is not null then
    update jornada_doente set estado = 'ativo'
    where doente_id = new.doente_id and etapa_id = v_seguinte;
  end if;
  return new;
end $$;

create trigger jornada_depois after update of estado on jornada_doente
  for each row execute function jornada_avancar();

-- 15.5 auditoria genérica: quem mexeu em quê, e quando (sem copiar conteúdo)
create or replace function auditar() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into auditoria (tabela, operacao, registo_id, utilizador)
  values (tg_table_name, tg_op,
          coalesce(to_jsonb(new) ->> 'id', to_jsonb(old) ->> 'id', to_jsonb(new) ->> 'doente_id', to_jsonb(old) ->> 'doente_id'),
          auth.uid());
  return coalesce(new, old);
end $$;

create trigger auditar_doentes      after insert or update or delete on doentes                 for each row execute function auditar();
create trigger auditar_perfis       after insert or update or delete on perfis                  for each row execute function auditar();
create trigger auditar_convites     after insert or update or delete on convites                for each row execute function auditar();
create trigger auditar_jornada      after update on jornada_doente                              for each row execute function auditar();
create trigger auditar_respostas    after insert or update or delete on respostas_questionario  for each row execute function auditar();
create trigger auditar_avaliacoes   after insert or update or delete on avaliacoes_audiologicas for each row execute function auditar();
create trigger auditar_programacoes after insert or update or delete on programacoes            for each row execute function auditar();
create trigger auditar_decisoes     after insert or update or delete on decisoes_candidatura    for each row execute function auditar();


-- ============================================================================
-- 16. FUNÇÕES CHAMADAS PELA PLATAFORMA (RPC)
-- ============================================================================

-- 16.1 contexto da sessão: papel, doente e grupo — decide para onde ir ao entrar
create or replace function meu_contexto() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'papel',         p.papel,
    'nome',          p.nome,
    'especialidade', p.especialidade,
    'relacao',       p.relacao,
    'doente_id',     d.id,
    'doente_nome',   d.nome,
    'processo',      d.processo,
    'grupo',         d.grupo
  )
  from perfis p left join doentes d on d.id = p.doente_id
  where p.id = auth.uid();
$$;

-- 16.2 cria o convite e devolve o código UMA vez (na base fica só o hash)
create or replace function criar_convite(
  p_doente_id uuid, p_email text, p_nome text, p_relacao text
) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_codigo text;
begin
  if not is_profissional() then
    raise exception 'Só um profissional pode criar convites.';
  end if;
  if p_email is null or position('@' in p_email) = 0 then
    raise exception 'Indique um email válido para a conta.';
  end if;

  -- 8 caracteres sem letras ambíguas (sem 0/O, 1/I/L)
  select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', (get_byte(b, i) % 31) + 1, 1), '')
    into v_codigo
  from (select gen_random_bytes(8) as b) x, generate_series(0, 7) as i;

  -- um convite novo anula os anteriores ainda não usados para o mesmo email e doente
  update convites set expira_em = now()
  where doente_id = p_doente_id and lower(email) = lower(p_email) and usado_em is null;

  insert into convites (doente_id, email, nome_titular, relacao, codigo_hash, expira_em, criado_por)
  values (p_doente_id, lower(trim(p_email)), p_nome, p_relacao,
          crypt(v_codigo, gen_salt('bf')), now() + interval '7 days', auth.uid());

  return v_codigo;
end $$;

-- 16.3 o utilizador, já com sessão iniciada com o email do convite, ativa a conta
create or replace function ativar_conta(p_codigo text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_uid     uuid := auth.uid();
  v_email   text := lower(auth.jwt() ->> 'email');
  v_convite convites%rowtype;
begin
  if v_uid is null then
    raise exception 'Sessão não iniciada.';
  end if;

  -- idempotente: se a conta já está ativada, devolve o contexto
  if exists (select 1 from perfis where id = v_uid) then
    return meu_contexto();
  end if;

  select * into v_convite from convites
  where lower(email) = v_email
    and usado_em is null
    and expira_em > now()
    and codigo_hash = crypt(upper(trim(p_codigo)), codigo_hash)
  order by criado_em desc
  limit 1;

  if not found then
    raise exception 'Código inválido, já usado ou expirado para este email.';
  end if;

  insert into perfis (id, papel, nome, doente_id, relacao)
  values (v_uid, 'utilizador', v_convite.nome_titular, v_convite.doente_id, v_convite.relacao);

  update convites set usado_em = now(), user_id = v_uid where id = v_convite.id;

  return meu_contexto();
end $$;

-- 16.4 responder a um questionário (valida o pedido e regista quem respondeu)
create or replace function responder_questionario(
  p_pedido_id uuid, p_respostas jsonb, p_pontuacao numeric, p_subescalas jsonb
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_pedido pedidos_questionario%rowtype;
  v_doente doentes%rowtype;
  v_id     uuid;
begin
  select * into v_pedido from pedidos_questionario where id = p_pedido_id;
  if not found then raise exception 'Pedido não encontrado.'; end if;
  if not acesso_doente(v_pedido.doente_id) then raise exception 'Sem acesso a este doente.'; end if;
  if v_pedido.estado <> 'pendente' then raise exception 'Este questionário já não está por responder.'; end if;

  select * into v_doente from doentes where id = v_pedido.doente_id;

  insert into respostas_questionario (
    pedido_id, doente_id, questionario_id, momento, papel_respondente, respondido_por,
    idade_meses, idade_auditiva_meses, respostas, pontuacao, subescalas
  ) values (
    v_pedido.id, v_pedido.doente_id, v_pedido.questionario_id, v_pedido.momento,
    case when is_profissional() then 'clinico' else v_pedido.respondente end,
    auth.uid(),
    case when v_doente.data_nascimento is not null
         then (extract(year from age(current_date, v_doente.data_nascimento)) * 12
              + extract(month from age(current_date, v_doente.data_nascimento)))::int end,
    case when v_doente.data_ativacao is not null
         then (extract(year from age(current_date, v_doente.data_ativacao)) * 12
              + extract(month from age(current_date, v_doente.data_ativacao)))::int end,
    p_respostas, p_pontuacao, p_subescalas
  ) returning id into v_id;

  update pedidos_questionario set estado = 'respondido', respondido_em = now() where id = v_pedido.id;
  return v_id;
end $$;

-- 16.5 o utilizador pede apoio (intérprete, transcrição...) para uma marcação sua
create or replace function pedir_apoio_marcacao(p_marcacao_id uuid, p_apoios text[]) returns void
language plpgsql security definer set search_path = public as $$
declare v_doente uuid;
begin
  select doente_id into v_doente from marcacoes where id = p_marcacao_id;
  if v_doente is null or not acesso_doente(v_doente) then
    raise exception 'Marcação não encontrada.';
  end if;
  update marcacoes set apoio_pedido = coalesce(p_apoios, '{}'), apoio_garantido = false
  where id = p_marcacao_id;
end $$;

-- 16.6 marcar as mensagens do outro lado como lidas
create or replace function marcar_mensagens_lidas(p_doente_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if is_profissional() then
    update mensagens set lida_equipa_em = now()
    where doente_id = p_doente_id and papel_autor = 'utilizador' and lida_equipa_em is null;
  elsif p_doente_id = meu_doente_id() then
    update mensagens set lida_utilizador_em = now()
    where doente_id = p_doente_id and papel_autor = 'profissional' and lida_utilizador_em is null;
  end if;
end $$;

-- 16.7 dar acesso de profissional a uma conta existente.
--      NÃO é chamável pela plataforma: corre-se no SQL Editor (ver 03_...).
create or replace function promover_profissional(p_email text, p_nome text, p_especialidade text)
returns text
language plpgsql security definer set search_path = public as $$
declare v_uid uuid;
begin
  select id into v_uid from auth.users where lower(email) = lower(trim(p_email));
  if v_uid is null then
    raise exception 'Não existe nenhuma conta com o email %. Crie-a primeiro em Authentication → Users.', p_email;
  end if;
  insert into perfis (id, papel, nome, especialidade)
  values (v_uid, 'profissional', p_nome, p_especialidade)
  on conflict (id) do update
    set papel = 'profissional', nome = excluded.nome,
        especialidade = excluded.especialidade, doente_id = null, relacao = null;
  return 'Conta ' || p_email || ' com acesso de profissional.';
end $$;

revoke execute on function promover_profissional(text, text, text) from public, anon, authenticated;


-- ============================================================================
-- 17. VISTAS
-- ============================================================================

-- 17.1 estado de cada doente: etapa atual, progresso, uso, próxima marcação
create or replace view v_estado_doente with (security_invoker = true) as
select
  d.id as doente_id, d.nome, d.processo, d.grupo, d.data_nascimento, d.estado,
  d.lado_implante, d.data_ativacao, d.criado_em,
  ea.etapa_id, em.titulo as etapa_titulo, em.fase, em.fase_curta, em.fase_ordem,
  (select count(*) from jornada_doente j join etapas_modelo e on e.id = j.etapa_id
    where j.doente_id = d.id and e.grupo = d.grupo and j.estado = 'feito') as etapas_feitas,
  (select count(*) from etapas_modelo e where e.grupo = d.grupo) as etapas_total,
  (select p.uso_medio_h from programacoes p
    where p.doente_id = d.id and p.uso_medio_h is not null order by p.data desc limit 1) as uso_h,
  (select min(m.quando) from marcacoes m
    where m.doente_id = d.id and m.quando > now() and m.estado in ('marcada','confirmada')) as proxima_marcacao,
  (select count(*) from pedidos_questionario q
    where q.doente_id = d.id and q.estado = 'pendente') as proms_pendentes,
  (select count(*) from mensagens x
    where x.doente_id = d.id and x.papel_autor = 'utilizador' and x.lida_equipa_em is null) as mensagens_por_ler,
  (select count(*) from perfis pf where pf.doente_id = d.id) as contas_ativas,
  coalesce(pc.usa_lgp, false) as usa_lgp,
  coalesce(pc.precisa_interprete, false) as precisa_interprete
from doentes d
left join lateral (
  select j.etapa_id from jornada_doente j join etapas_modelo e on e.id = j.etapa_id
  where j.doente_id = d.id and e.grupo = d.grupo and j.estado = 'ativo'
  order by e.fase_ordem, e.ordem limit 1
) ea on true
left join etapas_modelo em on em.id = ea.etapa_id
left join preferencias_comunicacao pc on pc.doente_id = d.id;

-- 17.2 alertas: cada linha é uma regra que disparou; os tratados saem da lista
create or replace view v_alertas with (security_invoker = true) as
with base as (
  -- etapa ativa há mais tempo do que o prazo de referência
  select 'etapa:' || j.id as chave, d.id as doente_id, 'alerta'::text as nivel,
         'etapa_atrasada'::text as regra,
         ('Etapa parada: ' || e.titulo) as titulo,
         ('Em curso desde ' || to_char(j.iniciada_em, 'DD/MM/YYYY') || '; prazo de referência de '
           || e.prazo_dias || ' dias.') as detalhe,
         j.iniciada_em as desde
  from jornada_doente j
  join etapas_modelo e on e.id = j.etapa_id
  join doentes d on d.id = j.doente_id
  where j.estado = 'ativo' and e.grupo = d.grupo and d.estado = 'ativo'
    and e.prazo_dias is not null
    and j.iniciada_em < now() - make_interval(days => e.prazo_dias)

  union all
  -- uso do processador abaixo de 6 h/dia no primeiro ano após a ativação
  select 'uso:' || p.id, d.id, 'alerta', 'uso_baixo',
         'Uso diário do processador abaixo de 6 h',
         'Última leitura: ' || replace(p.uso_medio_h::text, '.', ',') || ' h/dia em '
           || to_char(p.data, 'DD/MM/YYYY') || '.',
         p.data::timestamptz
  from doentes d
  join lateral (
    select * from programacoes pp
    where pp.doente_id = d.id and pp.uso_medio_h is not null
    order by pp.data desc limit 1
  ) p on true
  where d.estado = 'ativo' and p.uso_medio_h < 6
    and (d.data_ativacao is null or p.data <= d.data_ativacao + interval '12 months')

  union all
  -- questionário enviado há mais de 7 dias sem resposta
  select 'prom:' || q.id, q.doente_id, 'aviso', 'prom_pendente',
         'Questionário por responder: ' || qq.sigla,
         'Enviado a ' || to_char(q.enviado_em, 'DD/MM/YYYY') || '.',
         q.enviado_em
  from pedidos_questionario q
  join questionarios qq on qq.id = q.questionario_id
  where q.estado = 'pendente' and q.enviado_em < now() - interval '7 days'

  union all
  -- utilizador de LGP com consulta nos próximos 7 dias sem intérprete garantido
  select 'interprete:' || m.id, m.doente_id, 'aviso', 'sem_interprete',
         'Consulta sem intérprete de LGP garantido',
         m.tipo || ' a ' || to_char(m.quando, 'DD/MM/YYYY "às" HH24:MI') || '.',
         m.criado_em
  from marcacoes m
  join preferencias_comunicacao pc on pc.doente_id = m.doente_id
  where (pc.usa_lgp or pc.precisa_interprete)
    and m.estado in ('marcada','confirmada')
    and m.quando between now() and now() + interval '7 days'
    and not m.apoio_garantido

  union all
  -- pedido de consulta feito pelo próprio utilizador
  select 'pedido:' || m.id, m.doente_id, 'aviso', 'pedido_marcacao',
         'Pedido de consulta feito pelo utilizador',
         coalesce(nullif(m.motivo, ''), 'Sem motivo indicado.'),
         m.criado_em
  from marcacoes m
  where m.estado = 'pedido'

  union all
  -- mensagem urgente ainda não lida pela equipa
  select 'msg:' || x.id, x.doente_id, 'alerta', 'mensagem_urgente',
         'Mensagem urgente por ler',
         left(x.texto, 160),
         x.criado_em
  from mensagens x
  where x.urgente and x.papel_autor = 'utilizador' and x.lida_equipa_em is null

  union all
  -- expectativas antes do implante acima do que é típico em utilizadores experientes
  -- (CIQOL-Expectations acima da média normativa do CIQOL-35 + 1 desvio-padrão;
  --  normas de McRackan et al., 2022, n = 705)
  select 'expect:' || r.id, r.doente_id, 'aviso', 'expectativas',
         'Expectativas acima do resultado típico',
         'Domínios acima da norma + 1 DP: ' || string_agg(k.key, ', ' order by k.key)
           || '. Rever no aconselhamento pré-implante.',
         r.criado_em
  from respostas_questionario r
  join questionarios n on n.id = 'ciqol35'
  cross join lateral jsonb_each_text(coalesce(r.subescalas, '{}'::jsonb)) k
  where r.questionario_id = 'ciqol_exp'
    and n.normas ? k.key
    and k.value ~ '^-?[0-9]+(\.[0-9]+)?$'
    and k.value::numeric > (n.normas -> k.key ->> 'media')::numeric + (n.normas -> k.key ->> 'dp')::numeric
  group by r.id, r.doente_id, r.criado_em

  union all
  -- criança com menos de 18 meses à espera de cirurgia há mais de 30 dias
  select 'pedcir:' || j.id, d.id, 'alerta', 'prioridade_pediatrica',
         'Criança com menos de 18 meses a aguardar cirurgia',
         'A aguardar há ' || extract(day from now() - j.iniciada_em)::int || ' dias.',
         j.iniciada_em
  from jornada_doente j
  join doentes d on d.id = j.doente_id
  where j.etapa_id = 'p_cirurgia' and j.estado = 'ativo'
    and d.data_nascimento > current_date - interval '18 months'
    and j.iniciada_em < now() - interval '30 days'

  union all
  -- processador com mais de 5 anos: reavaliar atualização com PROMs + testes vocais
  select 'upgrade:' || p.id, p.doente_id, 'info', 'reavaliar_processador',
         'Processador com mais de 5 anos',
         'Entregue a ' || to_char(p.entregue_em, 'DD/MM/YYYY')
           || coalesce(' (' || p.lado || ')', '')
           || '. Avaliar atualização: APHAB + APSQ e testes vocais antes e 4 semanas depois.',
         p.entregue_em::timestamptz
  from processadores p
  where p.substituido_em is null and p.entregue_em < current_date - interval '5 years'

  union all
  -- indicação para reabilitação musical (fator de reabilitação MuRQoL ≥ 1)
  select 'musica:' || r.id, r.doente_id, 'info', 'reabilitacao_musical',
         'Indicação para reabilitação musical',
         'Fator de reabilitação MuRQoL de '
           || replace(round((r.subescalas ->> 'fator_reabilitacao')::numeric, 2)::text, '.', ',')
           || ': a música importa-lhe mais do que a consegue viver.',
         r.criado_em
  from respostas_questionario r
  where r.questionario_id = 'murqol'
    and (r.subescalas ->> 'fator_reabilitacao') ~ '^-?[0-9]+(\.[0-9]+)?$'
    and (r.subescalas ->> 'fator_reabilitacao')::numeric >= 1
)
select b.*, d.nome, d.processo, d.grupo
from base b
join doentes d on d.id = b.doente_id
where not exists (select 1 from alertas_tratados t where t.chave = b.chave);


-- ============================================================================
-- 18. INDICADORES DO CENTRO
-- ============================================================================
create or replace function indicadores_centro() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare v jsonb;
begin
  if not is_profissional() then
    raise exception 'Só profissionais.';
  end if;

  select jsonb_build_object(
    'em_seguimento', (select count(*) from doentes where estado = 'ativo'),
    'abandono',      (select count(*) from doentes where estado = 'abandono'),
    'por_grupo', (select coalesce(jsonb_object_agg(grupo, n), '{}'::jsonb)
                  from (select grupo, count(*) n from doentes where estado = 'ativo' group by grupo) x),
    'por_fase', (select coalesce(jsonb_agg(jsonb_build_object('grupo', grupo, 'fase', fase_curta, 'ordem', fase_ordem, 'n', n)
                                   order by grupo, fase_ordem), '[]'::jsonb)
                 from (select grupo, fase_curta, fase_ordem, count(*) n
                       from v_estado_doente where estado = 'ativo' and fase_curta is not null
                       group by grupo, fase_curta, fase_ordem) x),
    'dias_referencia_cirurgia', (
      select jsonb_build_object(
        'mediana', percentile_cont(0.5) within group (order by dias),
        'n', count(*))
      from (
        select (c.data_efetiva - r.data_efetiva)::float8 as dias
        from jornada_doente r
        join jornada_doente c on c.doente_id = r.doente_id
        where ((r.etapa_id = 'a_ref' and c.etapa_id = 'a_cirurgia')
            or (r.etapa_id = 'p_reteste' and c.etapa_id = 'p_cirurgia'))
          and r.data_efetiva is not null and c.data_efetiva is not null
      ) x),
    'proms', (
      select jsonb_build_object(
        'enviados', count(*),
        'respondidos', count(*) filter (where estado = 'respondido'),
        'taxa', round(100.0 * count(*) filter (where estado = 'respondido') / nullif(count(*) filter (where estado <> 'cancelado'), 0), 1))
      from pedidos_questionario where enviado_em > now() - interval '12 months'),
    'uso', (
      select jsonb_build_object(
        'media', round(avg(uso_h)::numeric, 1),
        'menos_4', count(*) filter (where uso_h < 4),
        'de_4_a_6', count(*) filter (where uso_h >= 4 and uso_h < 6),
        'de_6_a_10', count(*) filter (where uso_h >= 6 and uso_h < 10),
        'mais_10', count(*) filter (where uso_h >= 10))
      from v_estado_doente where estado = 'ativo' and uso_h is not null),
    'interprete', (
      select jsonb_build_object(
        'marcacoes', count(*),
        'garantido', count(*) filter (where m.apoio_garantido),
        'taxa', round(100.0 * count(*) filter (where m.apoio_garantido) / nullif(count(*), 0), 1))
      from marcacoes m join preferencias_comunicacao pc on pc.doente_id = m.doente_id
      where (pc.usa_lgp or pc.precisa_interprete) and m.quando > now() - interval '12 months'
        and m.estado in ('marcada','confirmada','realizada')),
    'prem_media', (select round(avg(pontuacao)::numeric, 1) from respostas_questionario
                   where questionario_id = 'prem_creic' and criado_em > now() - interval '12 months'),
    'expectativas_desalinhadas', (select count(distinct doente_id) from v_alertas where regra = 'expectativas'),
    'situacao_profissional', (
      select coalesce(jsonb_object_agg(situacao_profissional, n), '{}'::jsonb) from (
        select situacao_profissional, count(*) n from (
          select distinct on (doente_id) doente_id, situacao_profissional
          from resultados_sociais where situacao_profissional is not null
          order by doente_id, data desc) u
        group by situacao_profissional) x),
    'escolaridade', (
      select coalesce(jsonb_object_agg(escolaridade, n), '{}'::jsonb) from (
        select escolaridade, count(*) n from (
          select distinct on (doente_id) doente_id, escolaridade
          from resultados_sociais where escolaridade is not null
          order by doente_id, data desc) u
        group by escolaridade) x)
  ) into v;

  return v;
end $$;


-- ============================================================================
-- 19. ROW LEVEL SECURITY
--     Regra geral: o profissional vê tudo; o utilizador só o seu doente.
--     Sem isto, qualquer conta autenticada leria os dados de todos através
--     da API automática do Supabase.
-- ============================================================================
alter table doentes                  enable row level security;
alter table perfis                   enable row level security;
alter table preferencias_comunicacao enable row level security;
alter table etapas_modelo            enable row level security;
alter table jornada_doente           enable row level security;
alter table convites                 enable row level security;
alter table marcacoes                enable row level security;
alter table mensagens                enable row level security;
alter table questionarios            enable row level security;
alter table pedidos_questionario     enable row level security;
alter table respostas_questionario   enable row level security;
alter table avaliacoes_audiologicas  enable row level security;
alter table programacoes             enable row level security;
alter table processadores            enable row level security;
alter table exercicios               enable row level security;
alter table registos_exercicio       enable row level security;
alter table diario                   enable row level security;
alter table marcos_linguagem         enable row level security;
alter table resultados_sociais       enable row level security;
alter table decisoes_candidatura     enable row level security;
alter table alertas_tratados         enable row level security;
alter table auditoria                enable row level security;

-- doentes
create policy "doentes: leitura" on doentes for select using (acesso_doente(id));
create policy "doentes: profissional cria" on doentes for insert with check (is_profissional());
create policy "doentes: profissional edita" on doentes for update using (is_profissional()) with check (is_profissional());

-- perfis (criados só por ativar_conta() e promover_profissional())
create policy "perfis: o proprio" on perfis for select using (id = auth.uid());
create policy "perfis: profissional ve todos" on perfis for select using (is_profissional());
create policy "perfis: profissional remove contas de utilizador" on perfis for delete
  using (is_profissional() and papel = 'utilizador');

-- preferências: a equipa gere; o utilizador lê e atualiza as suas
create policy "preferencias: leitura" on preferencias_comunicacao for select using (acesso_doente(doente_id));
create policy "preferencias: profissional cria" on preferencias_comunicacao for insert with check (is_profissional());
create policy "preferencias: atualizacao" on preferencias_comunicacao for update
  using (acesso_doente(doente_id)) with check (acesso_doente(doente_id));

-- catálogos: leitura para qualquer conta autenticada
create policy "etapas_modelo: leitura" on etapas_modelo for select using (auth.uid() is not null);
create policy "questionarios: leitura" on questionarios for select using (auth.uid() is not null);
create policy "questionarios: profissional gere" on questionarios for all using (is_profissional()) with check (is_profissional());

-- jornada: a equipa atualiza; o utilizador lê
create policy "jornada: leitura" on jornada_doente for select using (acesso_doente(doente_id));
create policy "jornada: profissional gere" on jornada_doente for all using (is_profissional()) with check (is_profissional());

-- convites: só a equipa (e sem nunca ver o código, só o hash)
create policy "convites: profissional" on convites for select using (is_profissional());

-- marcações: a equipa gere; o utilizador lê as suas e só pode criar PEDIDOS
create policy "marcacoes: leitura" on marcacoes for select using (acesso_doente(doente_id));
create policy "marcacoes: profissional gere" on marcacoes for all using (is_profissional()) with check (is_profissional());
create policy "marcacoes: utilizador pede consulta" on marcacoes for insert with check (
  doente_id = meu_doente_id() and estado = 'pedido' and origem = 'utilizador' and quando is null
);

-- mensagens
create policy "mensagens: leitura" on mensagens for select using (acesso_doente(doente_id));
create policy "mensagens: envio" on mensagens for insert with check (
  autor_id = auth.uid() and (
    (is_profissional() and papel_autor = 'profissional')
    or (doente_id = meu_doente_id() and papel_autor = 'utilizador')
  )
);

-- questionários: a equipa envia; o utilizador responde através de responder_questionario()
create policy "pedidos: leitura" on pedidos_questionario for select using (acesso_doente(doente_id));
create policy "pedidos: profissional gere" on pedidos_questionario for all using (is_profissional()) with check (is_profissional());
create policy "respostas: leitura" on respostas_questionario for select using (acesso_doente(doente_id));
create policy "respostas: profissional gere" on respostas_questionario for all using (is_profissional()) with check (is_profissional());

-- dados clínicos: a equipa gere; o utilizador lê
create policy "avaliacoes: leitura" on avaliacoes_audiologicas for select using (acesso_doente(doente_id));
create policy "avaliacoes: profissional gere" on avaliacoes_audiologicas for all using (is_profissional()) with check (is_profissional());
create policy "programacoes: leitura" on programacoes for select using (acesso_doente(doente_id));
create policy "programacoes: profissional gere" on programacoes for all using (is_profissional()) with check (is_profissional());
create policy "processadores: leitura" on processadores for select using (acesso_doente(doente_id));
create policy "processadores: profissional gere" on processadores for all using (is_profissional()) with check (is_profissional());
create policy "marcos: leitura" on marcos_linguagem for select using (acesso_doente(doente_id));
create policy "marcos: profissional gere" on marcos_linguagem for all using (is_profissional()) with check (is_profissional());
create policy "sociais: leitura" on resultados_sociais for select using (acesso_doente(doente_id));
create policy "sociais: profissional gere" on resultados_sociais for all using (is_profissional()) with check (is_profissional());
create policy "decisoes: leitura" on decisoes_candidatura for select using (acesso_doente(doente_id));
create policy "decisoes: profissional gere" on decisoes_candidatura for all using (is_profissional()) with check (is_profissional());

-- reabilitação: a equipa prescreve; o utilizador regista o que fez
create policy "exercicios: leitura" on exercicios for select using (acesso_doente(doente_id));
create policy "exercicios: profissional gere" on exercicios for all using (is_profissional()) with check (is_profissional());
create policy "registos: leitura" on registos_exercicio for select using (acesso_doente(doente_id));
create policy "registos: registar" on registos_exercicio for insert with check (
  acesso_doente(doente_id)
  and exists (select 1 from exercicios e
              where e.id = registos_exercicio.exercicio_id and e.doente_id = registos_exercicio.doente_id)
);
create policy "registos: anular" on registos_exercicio for delete using (acesso_doente(doente_id));
create policy "diario: leitura" on diario for select using (acesso_doente(doente_id));
create policy "diario: escrever" on diario for insert with check (acesso_doente(doente_id) and autor_id = auth.uid());

-- alertas tratados e auditoria: só a equipa
create policy "alertas: profissional" on alertas_tratados for all using (is_profissional()) with check (is_profissional());
create policy "auditoria: profissional le" on auditoria for select using (is_profissional());
