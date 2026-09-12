-- ============================================================================
-- ESCUTA — esboço do modelo de dados (Supabase / PostgreSQL)
-- CREIC · Centro de Referência de Implante Coclear
--
-- Esboço, não versão final: serve para discutir com a equipa clínica o que a
-- plataforma precisa de guardar. Os nomes das tabelas seguem o vocabulário
-- usado na consulta, não o do software.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. DOENTES
-- ---------------------------------------------------------------------------
create table doentes (
  id                 uuid primary key default gen_random_uuid(),
  processo           text not null unique,
  nome               text not null,
  data_nascimento    date not null,
  tipo               text check (tipo in ('adulto','pediatrico')),
  origem_referencia  text,           -- rastreio neonatal, ORL externo, consulta interna
  data_referenciacao date,
  etiologia          text,           -- genética, meningite, otosclerose, ototoxicidade, presbiacusia...
  grau_surdez        text,           -- ligeira, moderada, severa, profunda (por orelha)
  lado_implante      text check (lado_implante in ('direito','esquerdo','bilateral','nenhum')),
  criado_em          timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 2. PREFERÊNCIAS DE COMUNICAÇÃO
--    Tabela própria, e não uma coluna solta, porque é consultada por todos os
--    módulos: marcações, mensagens, lembretes automáticos e alertas.
--    Sem isto, a plataforma telefona a quem não ouve.
-- ---------------------------------------------------------------------------
create table preferencias_comunicacao (
  doente_id          uuid primary key references doentes(id) on delete cascade,
  canal_preferido    text[] default '{}',   -- {plataforma, sms, email, video_legendado, video_lgp}
  canais_proibidos   text[] default '{}',   -- {chamada_telefonica}
  usa_lgp            boolean default false,
  precisa_interprete boolean default false,
  leitura_labial     boolean default false,
  linguagem_simples  boolean default false,
  notas              text,
  atualizado_em      timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 3. PERFIS DE ACESSO
-- ---------------------------------------------------------------------------
create table perfis (
  id            uuid primary key references auth.users(id) on delete cascade,
  papel         text not null check (papel in ('doente','familiar','profissional')),
  nome          text not null,
  doente_id     uuid references doentes(id),  -- doente ou familiar
  especialidade text,                          -- orl, audiologia, terapia_fala, psicologia, gestao_caso
  criado_em     timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 4. JORNADA — o modelo do percurso e o percurso de cada doente
-- ---------------------------------------------------------------------------
create table etapas_modelo (
  id        text primary key,        -- 'ref', 'orl1', 'audio1', ...
  fase      text not null,
  ordem     int  not null,
  titulo    text not null,
  quem      text,
  prazo_dias int,                    -- prazo-alvo; alimenta os alertas de percurso parado
  nota      text
);

create table jornada_doente (
  id           uuid primary key default gen_random_uuid(),
  doente_id    uuid references doentes(id) on delete cascade,
  etapa_id     text references etapas_modelo(id),
  estado       text check (estado in ('previsto','ativo','feito','nao_aplicavel')) default 'previsto',
  data_prevista date,
  data_efetiva  date,
  responsavel   uuid references auth.users(id),
  observacoes   text,
  atualizado_em timestamptz default now(),
  unique (doente_id, etapa_id)
);

-- ---------------------------------------------------------------------------
-- 5. AVALIAÇÕES AUDIOLÓGICAS
--    Os valores por frequência ficam em jsonb porque o protocolo muda com o
--    equipamento e com a idade (não faz sentido uma coluna por frequência).
-- ---------------------------------------------------------------------------
create table avaliacoes_audiologicas (
  id             uuid primary key default gen_random_uuid(),
  doente_id      uuid references doentes(id) on delete cascade,
  data           date not null,
  momento        text,            -- basal, com_protese, ativacao, 1m, 3m, 6m, 12m, anual
  condicao       text,            -- fone, campo_livre_protese, campo_livre_implante
  tonal          jsonb,           -- { "250":75, "500":80, ... }
  vocal_silencio numeric,         -- % de acerto
  vocal_ruido    numeric,         -- % de acerto, com relação sinal/ruído registada
  snr            numeric,
  teste_usado    text,
  notas          text,
  criado_por     uuid references auth.users(id)
);

-- ---------------------------------------------------------------------------
-- 6. CIRURGIA E DISPOSITIVO
-- ---------------------------------------------------------------------------
create table implantes (
  id              uuid primary key default gen_random_uuid(),
  doente_id       uuid references doentes(id) on delete cascade,
  lado            text check (lado in ('direito','esquerdo')),
  data_cirurgia   date,
  marca_modelo    text,
  numero_serie    text,
  eletrodos_ativos int,
  intercorrencias text,
  cirurgiao       text
);

create table processadores (
  id            uuid primary key default gen_random_uuid(),
  implante_id   uuid references implantes(id) on delete cascade,
  modelo        text,
  numero_serie  text,
  entregue_em   date,
  substituido_em date,
  motivo_substituicao text
);

-- ---------------------------------------------------------------------------
-- 7. PROGRAMAÇÕES (MAP) E DATALOGGING
-- ---------------------------------------------------------------------------
create table programacoes (
  id             uuid primary key default gen_random_uuid(),
  implante_id    uuid references implantes(id) on delete cascade,
  data           date not null,
  sessao         text,             -- ativacao, 1sem, 1m, 3m, 6m, 12m, extra
  estrategia     text,
  canais_ativos  int,
  impedancias    jsonb,
  queixas        text,
  plano          text,
  uso_medio_h    numeric,          -- datalogging lido nesta sessão
  criado_por     uuid references auth.users(id)
);

-- ---------------------------------------------------------------------------
-- 8. REABILITAÇÃO
-- ---------------------------------------------------------------------------
create table planos_reabilitacao (
  id          uuid primary key default gen_random_uuid(),
  doente_id   uuid references doentes(id) on delete cascade,
  inicio      date,
  fim         date,
  objetivos   text,
  terapeuta   uuid references auth.users(id)
);

create table exercicios (
  id        uuid primary key default gen_random_uuid(),
  plano_id  uuid references planos_reabilitacao(id) on delete cascade,
  titulo    text not null,
  frequencia text,
  alvo_semanal int,
  instrucoes text
);

create table registos_exercicio (
  id            uuid primary key default gen_random_uuid(),
  exercicio_id  uuid references exercicios(id) on delete cascade,
  data          date default current_date,
  concluido     boolean default true,
  nota_doente   text
);

create table diario_escuta (
  id         uuid primary key default gen_random_uuid(),
  doente_id  uuid references doentes(id) on delete cascade,
  semana     date,
  texto      text,
  como_correu int check (como_correu between 1 and 5),
  criado_em  timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 9. QUESTIONÁRIOS (PROMs)
--    A faixa etária e o respondente são colunas de primeira classe, não
--    metadados: o mesmo doente muda de instrumento e de respondente ao longo
--    da vida (pais -> criança -> o próprio), e uma série que misture proxy
--    com autorreporte sem o registar não é comparável.
-- ---------------------------------------------------------------------------
create table questionarios (
  id            text primary key,     -- ssq12, ciqol10, nciq, aphab, littlears, peach, hearql26...
  nome          text not null,
  tipo          text check (tipo in ('prom','clinro','obsro')),  -- reportado pelo doente / pelo clínico / por observador
  nucleo        boolean default false,                            -- pertence ao núcleo obrigatório
  idade_min_meses int,                -- 0 para recém-nascido
  idade_max_meses int,                -- null = sem limite superior
  por_idade_auditiva boolean default false,  -- LittlEARS conta do dia da ativação, não do nascimento
  respondente   text check (respondente in ('proprio','pai_mae_cuidador','educador_professor','clinico')),
  itens         int,
  minutos       int,
  momentos      text[],               -- {basal, pre_cirurgia, ativacao, 3m, 6m, 12m, anual, ano_letivo}
  versao_pt     text,                 -- 'validada', 'traduzida', 'a confirmar'
  licenca       text,                 -- 'livre', 'registo', 'licenca_paga'
  tem_video_lgp boolean default false,
  definicao     jsonb                 -- perguntas, escalas e regra de pontuação
);

comment on column questionarios.respondente is 'Quem preenche. Até aos 6 anos é o cuidador; dos 6 aos 12 a criança com apoio; a partir dos 13 o próprio.';

create table respostas_questionario (
  id               uuid primary key default gen_random_uuid(),
  doente_id        uuid references doentes(id) on delete cascade,
  questionario_id  text references questionarios(id),
  momento          text,
  idade_meses      int,               -- idade do doente à data da resposta
  idade_auditiva_meses int,           -- meses desde a ativação
  respondido_por   uuid references auth.users(id),
  papel_respondente text check (papel_respondente in ('proprio','pai_mae_cuidador','educador_professor','clinico')),
  respostas        jsonb,
  pontuacao        numeric,
  percentil_norma  numeric,           -- posição face à curva normativa, quando existe
  enviado_em       timestamptz,
  respondido_em    timestamptz
);

-- ---------------------------------------------------------------------------
-- 10. MARCAÇÕES, INTÉRPRETE E MENSAGENS
-- ---------------------------------------------------------------------------
create table marcacoes (
  id             uuid primary key default gen_random_uuid(),
  doente_id      uuid references doentes(id) on delete cascade,
  quando         timestamptz not null,
  tipo           text,
  local          text,
  especialidade  text,
  estado         text check (estado in ('marcada','confirmada','realizada','faltou','remarcada')) default 'marcada',
  apoio_pedido   text[],           -- {interprete_lgp, interprete_video, transcricao, acompanhante}
  apoio_garantido boolean default false
);

create table mensagens (
  id          uuid primary key default gen_random_uuid(),
  doente_id   uuid references doentes(id) on delete cascade,
  autor       uuid references auth.users(id),
  papel_autor text,
  texto       text not null,
  urgente     boolean default false,
  lida_em     timestamptz,
  criado_em   timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 11. REUNIÃO MULTIDISCIPLINAR
-- ---------------------------------------------------------------------------
create table reunioes (
  id        uuid primary key default gen_random_uuid(),
  data      timestamptz not null,
  local     text,
  presentes text[]
);

create table decisoes_candidatura (
  id           uuid primary key default gen_random_uuid(),
  reuniao_id   uuid references reunioes(id) on delete cascade,
  doente_id    uuid references doentes(id) on delete cascade,
  decisao      text check (decisao in ('candidato','nao_candidato','adiar','rever')),
  fundamentacao text,
  pendentes    text,
  registado_por uuid references auth.users(id),
  criado_em    timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 12. ALERTAS
--    Gerados por rotina agendada (pg_cron ou Edge Function), a partir das
--    regras acordadas com a equipa — ver area-profissional/alertas.html.
-- ---------------------------------------------------------------------------
create table alertas (
  id         uuid primary key default gen_random_uuid(),
  doente_id  uuid references doentes(id) on delete cascade,
  regra      text not null,
  nivel      text check (nivel in ('info','aviso','alerta')),
  titulo     text,
  detalhe    text,
  tratado_em timestamptz,
  tratado_por uuid references auth.users(id),
  criado_em  timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 13. SEGURANÇA (RLS) — esboço
--    Regra geral: o doente e os seus familiares veem apenas o seu processo;
--    o profissional vê os doentes do centro. Tudo fica registado em auditoria.
-- ---------------------------------------------------------------------------
alter table doentes                  enable row level security;
alter table jornada_doente           enable row level security;
alter table avaliacoes_audiologicas  enable row level security;
alter table mensagens                enable row level security;

create policy doente_ve_o_seu on doentes for select
  using (id = (select doente_id from perfis where id = auth.uid()));

create policy profissional_ve_todos on doentes for select
  using (exists (select 1 from perfis where id = auth.uid() and papel = 'profissional'));

-- (repetir o padrão para as restantes tabelas, sempre por doente_id)

-- ---------------------------------------------------------------------------
-- 14. PEDIATRIA — o que só existe no percurso dos 0 aos 18 anos
-- ---------------------------------------------------------------------------

-- quem tem acesso à área da criança, e até quando
create table responsaveis (
  id              uuid primary key default gen_random_uuid(),
  doente_id       uuid references doentes(id) on delete cascade,
  user_id         uuid references auth.users(id),
  relacao         text check (relacao in ('mae','pai','tutor','educador_professor','proprio')),
  nivel_acesso    text check (nivel_acesso in ('total','escolar','nenhum')) default 'total',
  inicio          date default current_date,
  fim             date,               -- preenchido na transição aos 18 anos
  criado_em       timestamptz default now()
);

comment on table responsaveis is 'Aos 18 anos o acesso passa para o próprio: fecham-se os registos dos pais (fim = data do aniversário) e cria-se o do jovem, salvo decisão dele em contrário.';

-- marcos de desenvolvimento da linguagem, medidos em idade auditiva
create table marcos_linguagem (
  id                   uuid primary key default gen_random_uuid(),
  doente_id            uuid references doentes(id) on delete cascade,
  marco                text not null,          -- 'reage ao nome', 'junta duas palavras'...
  idade_auditiva_alvo_meses int,
  atingido_em          date,
  confirmado_por       uuid references auth.users(id)
);

-- articulação com a creche ou escola
create table apoio_escolar (
  id             uuid primary key default gen_random_uuid(),
  doente_id      uuid references doentes(id) on delete cascade,
  ano_letivo     text,
  estabelecimento text,
  medidas        text[],        -- {fm, lugar_sala, formacao_equipa, educador_surdos, emaei}
  data_reuniao   date,
  relatorio_id   uuid,          -- documento entregue ao estabelecimento
  notas          text
);

-- data da ativação: é daqui que se conta a idade auditiva de toda a pediatria
create table ativacoes (
  id            uuid primary key default gen_random_uuid(),
  implante_id   uuid references implantes(id) on delete cascade,
  data_ativacao date not null
);

create table auditoria_acessos (
  id        uuid primary key default gen_random_uuid(),
  quem      uuid references auth.users(id),
  tabela    text,
  registo   uuid,
  acao      text,
  quando    timestamptz default now()
);
