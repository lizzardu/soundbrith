-- ============================================================================
-- SOUNDBIRTH — Dados de demonstração (OPCIONAL)
--
-- Sete doentes fictícios, com processos DEMO-xxxx. Cada um está preparado
-- para mostrar uma parte da plataforma e fazer disparar uma regra de alerta
-- diferente. As datas são relativas ao dia em que o script corre, por isso
-- os alertas aparecem sempre.
--
-- Não cria contas de login. Para entrar como utilizador de um destes doentes:
-- na área profissional, abra a ficha, "Criar acesso", e siga o convite.
--
-- Para apagar tudo o que este script criou:
--   delete from doentes where processo like 'DEMO-%';
-- ============================================================================

begin;

-- durante a carga, as etapas não avançam sozinhas
set local creic.sem_avanco = 'on';

-- ---------------------------------------------------------------------------
-- funções temporárias (desaparecem no fim da sessão)
-- ---------------------------------------------------------------------------
create function pg_temp.did(p_processo text) returns uuid language sql as $$
  select id from doentes where processo = p_processo;
$$;

-- marca etapas como feitas, espaçadas no tempo a partir de p_dias_inicio atrás
create function pg_temp.feitas(p_processo text, p_etapas text[], p_dias_inicio int, p_passo int) returns void
language plpgsql as $$
declare i int;
begin
  for i in 1 .. array_length(p_etapas, 1) loop
    update jornada_doente set estado = 'feito',
           data_efetiva = current_date - (p_dias_inicio - (i - 1) * p_passo)
    where doente_id = pg_temp.did(p_processo) and etapa_id = p_etapas[i];
  end loop;
end $$;

create function pg_temp.ativa(p_processo text, p_etapa text, p_dias int) returns void language sql as $$
  update jornada_doente set estado = 'ativo', iniciada_em = now() - make_interval(days => p_dias)
  where doente_id = pg_temp.did(p_processo) and etapa_id = p_etapa;
$$;

-- pedido de questionário já respondido, com a respetiva pontuação
create function pg_temp.respondido(p_processo text, p_q text, p_momento text, p_resp text,
                                   p_pont numeric, p_sub jsonb, p_dias int) returns void
language plpgsql as $$
declare v_pedido uuid;
begin
  insert into pedidos_questionario (doente_id, questionario_id, momento, respondente, estado, enviado_em, respondido_em)
  values (pg_temp.did(p_processo), p_q, p_momento, p_resp, 'respondido',
          now() - make_interval(days => p_dias + 3), now() - make_interval(days => p_dias))
  returning id into v_pedido;
  insert into respostas_questionario (pedido_id, doente_id, questionario_id, momento, papel_respondente, pontuacao, subescalas, criado_em)
  values (v_pedido, pg_temp.did(p_processo), p_q, p_momento, p_resp, p_pont, p_sub, now() - make_interval(days => p_dias));
end $$;


-- ===========================================================================
-- 1. MANUEL — adulto, implantado há 5 semanas, em programação e reabilitação
--    Mostra: jornada completa, uso a subir, audiograma antes/depois,
--    expectativas acima do típico (alerta), SSQ12 por responder (alerta)
-- ===========================================================================
insert into doentes (processo, nome, data_nascimento, grupo, sexo, lado_implante, etiologia,
                     data_referenciacao, data_ativacao, gestor_caso, notas)
values ('DEMO-0142', 'Manuel Torres Ribeiro', (current_date - interval '61 years 4 months')::date, 'adulto', 'M',
        'direito', 'Hipoacusia neurossensorial bilateral profunda, progressiva',
        current_date - 730, current_date - 35, 'Enf.ª Rita Moura', 'Doente fictício de demonstração.');

insert into preferencias_comunicacao (doente_id, canais, canais_proibidos, leitura_labial, linguagem_simples, notas)
values (pg_temp.did('DEMO-0142'), '{plataforma,sms}', '{chamada_telefonica}', true, true,
        'Prefere frases curtas. Vem acompanhado pela filha.');

select pg_temp.feitas('DEMO-0142',
  '{a_ref,a_orl1,a_audio1,a_protese,a_campo,a_imagem,a_etiologia,a_fala,a_psico,a_expectativas,a_preop,a_reuniao,a_decisao,a_lista}',
  730, 30);
select pg_temp.feitas('DEMO-0142', '{a_cirurgia,a_penso}', 65, 9);
select pg_temp.feitas('DEMO-0142', '{a_ativacao}', 35, 1);
select pg_temp.ativa('DEMO-0142', 'a_maps', 35);
select pg_temp.ativa('DEMO-0142', 'a_reabilitacao', 30);

insert into processadores (doente_id, lado, modelo, entregue_em)
values (pg_temp.did('DEMO-0142'), 'direito', 'Processador (demonstração)', current_date - 35);

insert into programacoes (doente_id, data, sessao, lado, uso_medio_h, queixas, plano) values
  (pg_temp.did('DEMO-0142'), current_date - 35, 'ativacao', 'direito', null, null, 'Primeiro mapa. Uso progressivo.'),
  (pg_temp.did('DEMO-0142'), current_date - 28, '1sem', 'direito', 4.1, 'Som metálico.', 'Subir níveis.'),
  (pg_temp.did('DEMO-0142'), current_date - 21, 'extra', 'direito', 5.6, null, null),
  (pg_temp.did('DEMO-0142'), current_date - 14, 'extra', 'direito', 6.2, null, null),
  (pg_temp.did('DEMO-0142'), current_date - 7,  '1m', 'direito', 7.4, 'Apito ao colocar de manhã.', 'Verificar íman.'),
  (pg_temp.did('DEMO-0142'), current_date - 1,  'extra', 'direito', 9.0, null, null);

insert into avaliacoes_audiologicas (doente_id, data, momento, condicao, tonal, vocal_silencio, vocal_ruido, teste) values
  (pg_temp.did('DEMO-0142'), current_date - 600, 'com_protese', 'campo_livre_protese',
   '{"250":75,"500":80,"1000":85,"2000":95,"4000":105,"8000":110}', 18, 4, 'Monossílabos, lista aberta'),
  (pg_temp.did('DEMO-0142'), current_date - 35, 'ativacao', 'campo_livre_implante',
   '{"250":45,"500":40,"1000":40,"2000":45,"4000":50,"8000":60}', 26, 8, 'Monossílabos, lista aberta'),
  (pg_temp.did('DEMO-0142'), current_date - 6, '1m', 'campo_livre_implante',
   '{"250":30,"500":30,"1000":25,"2000":30,"4000":35,"8000":45}', 44, 14, 'Monossílabos, lista aberta');

insert into marcacoes (doente_id, quando, tipo, local, profissional, estado) values
  (pg_temp.did('DEMO-0142'), date_trunc('day', now()) + interval '11 days 10 hours 30 minutes',
   'Programação do processador — 3 meses', 'CREIC · Audiologia 2', 'Audiologia', 'confirmada'),
  (pg_temp.did('DEMO-0142'), date_trunc('day', now()) + interval '18 days 15 hours',
   'Reabilitação auditiva', 'CREIC · Gabinete 4', 'Terapia da fala', 'confirmada'),
  (pg_temp.did('DEMO-0142'), date_trunc('day', now()) + interval '60 days 9 hours',
   'Avaliação de resultados aos 3 meses', 'CREIC · Cabine audiométrica', 'Audiologia', 'marcada');

insert into mensagens (doente_id, autor_nome, papel_autor, texto, lida_equipa_em, lida_utilizador_em, criado_em) values
  (pg_temp.did('DEMO-0142'), 'Enf.ª Rita Moura', 'profissional',
   'Bom dia, Sr. Manuel. A programação dos 3 meses está marcada. Traga o processador e os acessórios. Responda aqui se precisar de mudar a hora.',
   null, now() - interval '3 days', now() - interval '4 days'),
  (pg_temp.did('DEMO-0142'), 'Manuel Torres Ribeiro', 'utilizador',
   'Bom dia. Fica bem. Tenho notado um apito quando ponho o processador de manhã. É normal?',
   now() - interval '3 days', null, now() - interval '3 days 8 hours'),
  (pg_temp.did('DEMO-0142'), 'Dra. Inês Câmara', 'profissional',
   'Esse apito costuma ser o íman a assentar mal. Experimente desligar, voltar a colocar e verificar a bateria. Se piorar, escreva aqui.',
   null, null, now() - interval '2 days');

-- expectativas antes do implante: acima do típico em comunicação e esforço auditivo
select pg_temp.respondido('DEMO-0142', 'ciqol_exp', 'candidatura_antes_aconselhamento', 'proprio', 69,
  '{"comunicacao":75,"emocional":60,"entretenimento":70,"ambiente":72,"esforco_auditivo":70,"social":68,"global":69}', 420);
select pg_temp.respondido('DEMO-0142', 'ciqol10', 'basal', 'proprio', 31, '{"global":31}', 420);
select pg_temp.respondido('DEMO-0142', 'ssq12', 'basal', 'proprio', 2.9,
  '{"fala":2.4,"espacial":3.8,"qualidades":2.9,"global":2.9}', 420);
select pg_temp.respondido('DEMO-0142', 'hui3', 'basal', 'proprio', 0.58, null, 420);

insert into pedidos_questionario (doente_id, questionario_id, momento, respondente, prazo, enviado_em)
values (pg_temp.did('DEMO-0142'), 'ssq12', '3m', 'proprio', current_date + 5, now() - interval '9 days');

insert into exercicios (doente_id, titulo, frequencia, alvo_semanal, instrucoes) values
  (pg_temp.did('DEMO-0142'), 'Deteção dos sons de Ling', '2x/dia, 5 min', 7, 'Peça a alguém para dizer a, i, u, ch, s, m sem que veja a boca.'),
  (pg_temp.did('DEMO-0142'), 'Audiolivro com o texto à frente', '20 min/dia', 7, 'Ler enquanto ouve liga o som à palavra.'),
  (pg_temp.did('DEMO-0142'), 'Videochamada com pessoa conhecida', '2x/semana', 2, 'Temas previsíveis, combinados antes.');

insert into registos_exercicio (exercicio_id, doente_id, data)
select e.id, e.doente_id, current_date - d
from exercicios e cross join generate_series(0, 4) d
where e.doente_id = pg_temp.did('DEMO-0142') and e.titulo like 'Deteção%';

insert into resultados_sociais (doente_id, data, situacao_profissional, notas)
values (pg_temp.did('DEMO-0142'), current_date - 420, 'baixa', 'De baixa por dificuldade de comunicação no trabalho.');

insert into decisoes_candidatura (doente_id, data_reuniao, decisao, lado_proposto, fundamentacao)
values (pg_temp.did('DEMO-0142'), current_date - 400, 'candidato', 'direito',
        'Discriminação com prótese de 18%. Expectativas acima do típico discutidas na consulta de decisão.');


-- ===========================================================================
-- 2. LAURA — pediátrico, 3 anos, bilateral aos 11 meses, família bilingue
--    Mostra: idade auditiva, marcos de linguagem, LittlEARS e PEACH por
--    responder, consulta sem intérprete nos próximos dias (alerta)
-- ===========================================================================
insert into doentes (processo, nome, data_nascimento, grupo, sexo, lado_implante, etiologia,
                     data_referenciacao, data_ativacao, responsaveis, gestor_caso, notas)
values ('DEMO-0147', 'Laura Pinto Esteves', (current_date - interval '3 years 1 month')::date, 'pediatrico', 'F',
        'bilateral', 'Surdez congénita neurossensorial bilateral profunda (GJB2)',
        (current_date - interval '3 years')::date, (current_date - interval '25 months')::date,
        'Marta Pinto (mãe) e Hugo Esteves (pai)', 'Enf.ª Rita Moura', 'Doente fictícia de demonstração.');

insert into preferencias_comunicacao (doente_id, canais, canais_proibidos, usa_lgp, notas)
values (pg_temp.did('DEMO-0147'), '{plataforma,sms}', '{chamada_telefonica}', true,
        'Família bilingue: oral em casa, LGP com a educadora de surdos. Nunca telefonar durante o horário da creche.');

select pg_temp.feitas('DEMO-0147',
  '{p_rastreio,p_reteste,p_diagnostico,p_protese,p_precoce,p_modo,p_imagem,p_genetica,p_oftalmo,p_desenv,p_psico,p_preop,p_reuniao,p_consent,p_cirurgia,p_penso,p_ativacao}',
  1125, 23);   -- ativação há ~757 dias (25 meses), cirurgia aos ~11 meses de idade
select pg_temp.ativa('DEMO-0147', 'p_maps', 750);
select pg_temp.ativa('DEMO-0147', 'p_tav', 740);
select pg_temp.ativa('DEMO-0147', 'p_escola', 20);
select pg_temp.ativa('DEMO-0147', 'p_lgp', 700);
-- a terapia e as programações têm prazo de 400 dias: numa criança em seguimento
-- contínuo, isso não é atraso — marca-se a fase como tratada para o demo
insert into alertas_tratados (chave, doente_id, nota)
select 'etapa:' || j.id, j.doente_id, 'Seguimento contínuo (demonstração).'
from jornada_doente j where j.doente_id = pg_temp.did('DEMO-0147') and j.etapa_id in ('p_maps','p_tav','p_lgp');

insert into processadores (doente_id, lado, modelo, entregue_em) values
  (pg_temp.did('DEMO-0147'), 'direito', 'Processador pediátrico (demonstração)', (current_date - interval '25 months')::date),
  (pg_temp.did('DEMO-0147'), 'esquerdo', 'Processador pediátrico (demonstração)', (current_date - interval '25 months')::date);

insert into programacoes (doente_id, data, sessao, lado, uso_medio_h)
select pg_temp.did('DEMO-0147'), (current_date - make_interval(months => (6 - m)::int))::date, 'extra', 'bilateral', u
from unnest(array[6.8, 8.1, 9.4, 10.2, 10.9, 11.4]) with ordinality as t(u, m);

insert into marcos_linguagem (doente_id, marco, idade_auditiva_alvo_meses, atingido_em) values
  (pg_temp.did('DEMO-0147'), 'Reage ao nome', 3, (current_date - interval '22 months')::date),
  (pg_temp.did('DEMO-0147'), 'Balbucio com consoantes variadas', 6, (current_date - interval '19 months')::date),
  (pg_temp.did('DEMO-0147'), 'Primeiras palavras com significado', 12, (current_date - interval '13 months')::date),
  (pg_temp.did('DEMO-0147'), 'Junta duas palavras', 18, (current_date - interval '6 months')::date),
  (pg_temp.did('DEMO-0147'), 'Frases de três ou mais palavras', 24, null),
  (pg_temp.did('DEMO-0147'), 'Conversa com pares na creche', 30, null);

insert into marcacoes (doente_id, quando, tipo, local, profissional, estado) values
  (pg_temp.did('DEMO-0147'), date_trunc('day', now()) + interval '5 days 14 hours',
   'Terapia auditivo-verbal', 'CREIC · Gabinete 4', 'Terapia da fala', 'confirmada'),
  (pg_temp.did('DEMO-0147'), date_trunc('day', now()) + interval '20 days 10 hours',
   'Programação dos processadores', 'CREIC · Audiologia pediátrica', 'Audiologia', 'confirmada');
insert into marcacoes (doente_id, quando, tipo, local, profissional, estado, apoio_pedido) values
  (pg_temp.did('DEMO-0147'), date_trunc('day', now()) + interval '29 days 9 hours 30 minutes',
   'Reunião com a creche (EMAEI)', 'Creche · sala dos 3 anos', 'Gestão de caso', 'marcada', '{interprete_lgp}');

insert into mensagens (doente_id, autor_nome, papel_autor, texto, lida_equipa_em, lida_utilizador_em, criado_em) values
  (pg_temp.did('DEMO-0147'), 'Terapeuta da fala', 'profissional',
   'Na sessão de hoje a Laura juntou três palavras duas vezes. É um marco importante. Continuem a esperar depois de perguntar.',
   null, now() - interval '1 day', now() - interval '2 days'),
  (pg_temp.did('DEMO-0147'), 'Marta Pinto', 'utilizador',
   'Que bom! Uma dúvida: na creche tiraram-lhe o processador na sesta e esqueceram-se de o voltar a pôr. Devo dizer alguma coisa?',
   null, null, now() - interval '1 day');

insert into pedidos_questionario (doente_id, questionario_id, momento, respondente, prazo, enviado_em) values
  (pg_temp.did('DEMO-0147'), 'littlears', '24m', 'cuidador', current_date + 10, now() - interval '3 days'),
  (pg_temp.did('DEMO-0147'), 'peach', 'anual', 'cuidador', current_date + 10, now() - interval '3 days');
select pg_temp.respondido('DEMO-0147', 'littlears', '12m', 'cuidador', 24, '{"global":24}', 395);

insert into exercicios (doente_id, titulo, frequencia, alvo_semanal, instrucoes) values
  (pg_temp.did('DEMO-0147'), 'Sons de Ling em jogo', 'todos os dias, ao pequeno-almoço', 7, 'Tape a boca com a mão e veja se a Laura reage a cada som.'),
  (pg_temp.did('DEMO-0147'), 'Ler um livro juntos, a nomear figuras', 'antes de dormir', 7, 'Repetir e esperar: dar tempo para ela responder.'),
  (pg_temp.did('DEMO-0147'), 'Chamar de outra divisão', '3x/semana', 3, 'Ajuda a perceber se ouve à distância e com ruído de fundo.');

insert into resultados_sociais (doente_id, data, escolaridade, notas)
values (pg_temp.did('DEMO-0147'), current_date - 20, 'creche', 'Microfone remoto em uso; educadora de surdos uma vez por semana.');


-- ===========================================================================
-- 3. JOAQUIM — adulto, 74 anos, prova de próteses parada há 5 meses
--    Mostra: alerta de etapa atrasada
-- ===========================================================================
insert into doentes (processo, nome, data_nascimento, grupo, sexo, etiologia, data_referenciacao, notas)
values ('DEMO-0151', 'Joaquim Nunes Bastos', (current_date - interval '74 years')::date, 'adulto', 'M',
        'Presbiacusia avançada', current_date - 260, 'Doente fictício de demonstração. Vive sozinho.');
insert into preferencias_comunicacao (doente_id, canais, leitura_labial)
values (pg_temp.did('DEMO-0151'), '{plataforma,sms}', true);
select pg_temp.feitas('DEMO-0151', '{a_ref,a_orl1,a_audio1}', 260, 40);
select pg_temp.ativa('DEMO-0151', 'a_protese', 150);
insert into resultados_sociais (doente_id, data, situacao_profissional) values (pg_temp.did('DEMO-0151'), current_date - 250, 'reformado');


-- ===========================================================================
-- 4. SOFIA — adulta, 29 anos, utilizadora de LGP, à espera da reunião
--    Mostra: consulta nos próximos dias sem intérprete garantido (alerta)
-- ===========================================================================
insert into doentes (processo, nome, data_nascimento, grupo, sexo, etiologia, data_referenciacao, notas)
values ('DEMO-0153', 'Sofia Marques Lima', (current_date - interval '29 years')::date, 'adulto', 'F',
        'Surdez neurossensorial bilateral profunda pós-meningite', current_date - 330, 'Doente fictícia de demonstração.');
insert into preferencias_comunicacao (doente_id, canais, canais_proibidos, usa_lgp, precisa_interprete, leitura_labial, notas)
values (pg_temp.did('DEMO-0153'), '{plataforma,video_lgp}', '{chamada_telefonica}', true, true, true,
        'Intérprete de LGP presencial em todas as consultas.');
select pg_temp.feitas('DEMO-0153', '{a_ref,a_orl1,a_audio1,a_protese,a_campo,a_imagem,a_etiologia,a_fala,a_psico,a_expectativas,a_preop}', 330, 28);
select pg_temp.ativa('DEMO-0153', 'a_reuniao', 10);
insert into marcacoes (doente_id, quando, tipo, local, profissional, estado)
values (pg_temp.did('DEMO-0153'), date_trunc('day', now()) + interval '3 days 11 hours',
        'Consulta de decisão partilhada', 'CREIC · Consulta ORL', 'ORL', 'marcada');
select pg_temp.respondido('DEMO-0153', 'ciqol_exp', 'candidatura_depois_aconselhamento', 'proprio', 55,
  '{"comunicacao":58,"emocional":66,"entretenimento":50,"ambiente":62,"esforco_auditivo":48,"social":70,"global":55}', 40);
insert into resultados_sociais (doente_id, data, situacao_profissional) values (pg_temp.did('DEMO-0153'), current_date - 300, 'tempo_inteiro');


-- ===========================================================================
-- 5. TOMÁS — pediátrico, 14 meses, à espera de cirurgia há 42 dias
--    Mostra: alerta de prioridade pediátrica
-- ===========================================================================
insert into doentes (processo, nome, data_nascimento, grupo, sexo, etiologia, data_referenciacao, responsaveis, notas)
values ('DEMO-0158', 'Tomás Ferreira Alves', (current_date - interval '14 months')::date, 'pediatrico', 'M',
        'Surdez congénita profunda bilateral (GJB2)', (current_date - interval '13 months')::date,
        'Ana Ferreira (mãe)', 'Doente fictício de demonstração.');
insert into preferencias_comunicacao (doente_id, canais) values (pg_temp.did('DEMO-0158'), '{plataforma,email}');
select pg_temp.feitas('DEMO-0158', '{p_rastreio,p_reteste,p_diagnostico,p_protese,p_precoce,p_modo,p_imagem,p_genetica,p_oftalmo,p_desenv,p_psico,p_preop,p_reuniao,p_consent}', 400, 25);
select pg_temp.ativa('DEMO-0158', 'p_cirurgia', 42);
insert into decisoes_candidatura (doente_id, data_reuniao, decisao, lado_proposto, fundamentacao)
values (pg_temp.did('DEMO-0158'), current_date - 60, 'candidato', 'bilateral',
        'PEATC sem respostas até 95 dB, sem benefício com próteses. Implantação bilateral simultânea, prioridade alta.');


-- ===========================================================================
-- 6. AMÉLIA — adulta, 68 anos, uso baixo do processador e mensagem urgente
--    Mostra: alertas de uso baixo e de mensagem urgente
-- ===========================================================================
insert into doentes (processo, nome, data_nascimento, grupo, sexo, lado_implante, etiologia, data_referenciacao, data_ativacao, notas)
values ('DEMO-0160', 'Amélia Duarte Rocha', (current_date - interval '68 years')::date, 'adulto', 'F', 'esquerdo',
        'Hipoacusia neurossensorial súbita bilateral', current_date - 500, current_date - 60, 'Doente fictícia de demonstração.');
insert into preferencias_comunicacao (doente_id, canais, linguagem_simples) values (pg_temp.did('DEMO-0160'), '{plataforma,sms}', true);
select pg_temp.feitas('DEMO-0160', '{a_ref,a_orl1,a_audio1,a_protese,a_campo,a_imagem,a_etiologia,a_fala,a_psico,a_expectativas,a_preop,a_reuniao,a_decisao,a_lista,a_cirurgia,a_penso,a_ativacao}', 476, 26);   -- ativação há 60 dias
select pg_temp.ativa('DEMO-0160', 'a_maps', 60);
insert into processadores (doente_id, lado, modelo, entregue_em) values (pg_temp.did('DEMO-0160'), 'esquerdo', 'Processador (demonstração)', current_date - 60);
insert into programacoes (doente_id, data, sessao, lado, uso_medio_h, queixas) values
  (pg_temp.did('DEMO-0160'), current_date - 30, '1m', 'esquerdo', 3.8, 'Desconforto e som demasiado alto.'),
  (pg_temp.did('DEMO-0160'), current_date - 4, 'extra', 'esquerdo', 3.2, 'Deixou de usar à tarde.');
insert into mensagens (doente_id, autor_nome, papel_autor, texto, urgente, criado_em)
values (pg_temp.did('DEMO-0160'), 'Amélia Duarte Rocha', 'utilizador',
        'URGENTE: o processador faz um barulho muito alto quando ligo e dói-me. Deixei de o pôr.', true, now() - interval '5 hours');


-- ===========================================================================
-- 7. RUI — adulto, implantado há 8 anos, em seguimento anual
--    Mostra: processador com mais de 5 anos, indicação para reabilitação
--    musical, pedido de consulta feito pelo utilizador (três alertas)
-- ===========================================================================
insert into doentes (processo, nome, data_nascimento, grupo, sexo, lado_implante, etiologia, data_referenciacao, data_ativacao, notas)
values ('DEMO-0112', 'Rui Baptista Coelho', (current_date - interval '52 years')::date, 'adulto', 'M', 'direito',
        'Otosclerose avançada', (current_date - interval '9 years')::date, (current_date - interval '8 years')::date,
        'Doente fictício de demonstração. Músico amador.');
insert into preferencias_comunicacao (doente_id, canais) values (pg_temp.did('DEMO-0112'), '{plataforma,email}');
select pg_temp.feitas('DEMO-0112', '{a_ref,a_orl1,a_audio1,a_protese,a_campo,a_imagem,a_etiologia,a_fala,a_psico,a_expectativas,a_preop,a_reuniao,a_decisao,a_lista,a_cirurgia,a_penso,a_ativacao,a_maps,a_reabilitacao,a_resultados}', 3285, 20);
select pg_temp.ativa('DEMO-0112', 'a_longo', 2000);
insert into alertas_tratados (chave, doente_id, nota)
select 'etapa:' || j.id, j.doente_id, 'Seguimento anual sem prazo.'
from jornada_doente j where j.doente_id = pg_temp.did('DEMO-0112') and j.etapa_id = 'a_longo';
insert into processadores (doente_id, lado, modelo, entregue_em)
values (pg_temp.did('DEMO-0112'), 'direito', 'Processador (demonstração)', (current_date - interval '7 years')::date);
insert into programacoes (doente_id, data, sessao, lado, uso_medio_h) values (pg_temp.did('DEMO-0112'), current_date - 90, 'anual', 'direito', 13.5);
select pg_temp.respondido('DEMO-0112', 'murqol', 'anual', 'proprio', null,
  '{"frequencia":2.4,"importancia":3.7,"fator_reabilitacao":1.3}', 85);
select pg_temp.respondido('DEMO-0112', 'ciqol10', 'anual', 'proprio', 64, '{"global":64}', 85);
insert into marcacoes (doente_id, tipo, estado, origem, motivo, criado_em)
values (pg_temp.did('DEMO-0112'), 'Pedido de consulta', 'pedido', 'utilizador',
        'Gostava de falar sobre trocar o processador. Com o atual tenho muita dificuldade com a música.', now() - interval '2 days');
insert into resultados_sociais (doente_id, data, situacao_profissional) values (pg_temp.did('DEMO-0112'), current_date - 85, 'tempo_inteiro');

commit;

-- confirmação: deve ver 7 doentes e cerca de 10 alertas
select processo, nome, grupo, etapa_titulo, uso_h from v_estado_doente where processo like 'DEMO-%' order by processo;
