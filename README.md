# SoundBirth — esboço de plataforma para o CREIC

Acompanhamento da jornada do doente com surdez e indicação para implante coclear.
Protótipo navegável, em HTML/CSS/JS, com **dados fictícios** e sem valor clínico.

> A marca SoundBirth (logótipo e nome) está aplicada no cabeçalho, no ecrã inicial e no
> favicon. Os ficheiros do logótipo estão em `assets/img/`. O que interessa discutir é o
> modelo do percurso, não a marca.

---

## 1. O que este esboço resolve

Entre a referenciação e a primeira conversa ao telefone com um neto passam-se, tipicamente,
dois anos, seis especialidades e cerca de vinte etapas. Hoje esse percurso vive espalhado
por processos clínicos, folhas de cálculo e a memória de quem gere os casos. Daí os três
problemas que a plataforma ataca:

1. **O doente não sabe onde está.** A espera sem explicação lê-se como abandono, e a
   desistência acontece antes da decisão de candidatura.
2. **A candidatura pára sem que ninguém veja.** Falta uma TC, falta a reavaliação no fim da
   prova de próteses, falta a avaliação de psicologia — e o processo só volta à luz na
   reunião seguinte.
3. **O resultado decide-se depois da cirurgia.** O implante dá acesso ao som; ouvir
   constrói-se nas horas de uso diário e na reabilitação. O uso baixo nos primeiros meses é
   visível nos dados muito antes de ser visível na consulta.

## 2. O princípio de desenho: os utilizadores não ouvem

É isto que distingue esta plataforma de qualquer outra de seguimento, e condiciona todas as
decisões de produto:

- Comunicação **por escrito por omissão** — mensagem na plataforma, SMS e email. A chamada
  telefónica é exceção, e pode ser desativada no perfil.
- Preferência de comunicação como **campo obrigatório do perfil** (escrito, LGP, leitura
  labial, transcrição, intérprete presencial ou remoto), visível no topo da ficha clínica e
  transportada para cada marcação.
- Todos os conteúdos com **legendas, transcrição escrita e versão em Língua Gestual
  Portuguesa**.
- Pedido de intérprete feito junto com a marcação, com alerta automático quando um doente
  utilizador de LGP tem consulta sem intérprete atribuído.
- Linguagem clara, um assunto por ecrã, contraste AA, alvos de toque de 44 px, navegação por
  teclado, alertas visuais e nunca sonoros.

## 3. As duas jornadas

O esqueleto clínico da plataforma. Cada doente tem uma cópia do percurso da sua idade, com
datas, estado e responsável — a mesma linha vista em linguagem simples pelo doente ou pela
família, e em linguagem clínica pela equipa. Em produção, ambas vivem na tabela
`etapas_modelo`, distinguidas por percurso.

**Adulto — 6 fases, 20 etapas** (`assets/js/dados.js` → `CREIC.jornadaModelo`)

| Fase | Etapas |
|---|---|
| 1. Referenciação e primeira avaliação | Referenciação · 1.ª consulta de ORL · Avaliação audiológica de base |
| 2. Otimização protésica e estudo de candidatura | Prova de próteses (3 meses) · Reavaliação em campo livre · TC + RM · Estudo etiológico e genético · Terapia da fala · Psicologia · Pré-operatório e vacinação |
| 3. Decisão | Reunião do grupo de implante · Consulta de decisão partilhada · Inscrição em lista cirúrgica |
| 4. Cirurgia | Implantação · Consulta de penso |
| 5. Ativação e programação | Ativação do processador · Programações seriadas (1 sem, 1, 3, 6, 12 meses) |
| 6. Reabilitação e resultados | Reabilitação auditiva · Avaliação de resultados 3/6/12 meses · Seguimento a longo prazo |

**Pediátrico — 7 fases, 23 etapas** (`assets/js/dados-pediatria.js` → `CREIC.jornadaPediatrica`)

| Fase | Etapas |
|---|---|
| 1. Deteção e diagnóstico | Rastreio auditivo neonatal · Reteste e referenciação · Diagnóstico audiológico |
| 2. Intervenção precoce e próteses | Adaptação de próteses · Intervenção precoce e apoio à família · Escolha informada do modo de comunicação |
| 3. Estudo de candidatura | TC + RM · Estudo genético · **Oftalmologia** (exclui Usher) · Desenvolvimento e linguagem · Psicologia e família · Pré-operatório e vacinação |
| 4. Decisão e cirurgia | Reunião do grupo · Consentimento dos responsáveis · Cirurgia, idealmente antes dos 12-18 meses e em regra bilateral simultânea |
| 5. Ativação e programação | Ativação com medidas objetivas · Programações mensais no 1.º ano |
| 6. Reabilitação, creche e escola | Terapia auditivo-verbal com a família na sala · Articulação com a escola (FM, acústica, EMAEI) · Acesso a LGP e a pares |
| 7. Resultados e transição | Avaliação de resultados e da linguagem · Seguimento anual · **Transição para a área de adulto** entre os 16 e os 18 anos |

O percurso pediátrico é governado pela **regra 1-3-6** (rastreio até ao 1.º mês, diagnóstico
até aos 3, intervenção até aos 6) e acompanhado pela **idade auditiva** — o tempo desde a
ativação, que é o que permite comparar o progresso com as curvas normativas.

Cada etapa traz **quem a faz** e um **prazo-alvo**. É do prazo-alvo que nascem os alertas de
percurso parado — a etapa que passa do prazo aparece sozinha na lista da equipa.

## 4. O que cada lado vê

São **três áreas**, não duas: o adulto, a família da criança (0 aos 18 anos) e a equipa. O
percurso pediátrico não é o do adulto encurtado — começa no rastreio auditivo neonatal, corre
contra o relógio da plasticidade auditiva, envolve a creche e a escola, e quem responde pelo
doente muda com a idade. Por isso tem jornada própria (7 fases, 23 etapas) e área própria.

**Área do adulto — 18 anos ou mais** (`area-doente/`)

| Página | Para quê |
|---|---|
| `dashboard.html` | Onde estou, o que vem a seguir, o que está por fazer, uso diário do processador |
| `jornada.html` | O percurso completo, etapa a etapa, com datas e responsáveis |
| `marcacoes.html` | Consultas, remarcação e **pedido de intérprete de LGP** |
| `audicao.html` | Audiograma antes/depois e discriminação vocal, explicados em linguagem simples |
| `reabilitacao.html` | Treino em casa da semana e diário de escuta |
| `questionarios.html` | PROMs (SSQ12, NCIQ, satisfação) com exemplo preenchível |
| `mensagens.html` | Canal escrito com a equipa e preferências de contacto |
| `recursos.html` | Vídeos com LGP + legendas, resolução de avarias, FAQ |

**Área da família — 0 aos 18 anos** (`area-familia/`)

| Página | Para quê |
|---|---|
| `dashboard.html` | Idade auditiva, marcos de linguagem, uso dos processadores, o que está por fazer |
| `jornada.html` | Do rastreio na maternidade à transição para a área de adulto, com a regra 1-3-6 |
| `marcacoes.html` | Consultas, terapia, reuniões com a creche e pedido de intérprete |
| `treino.html` | Atividades de linguagem na rotina de casa e o que está combinado com a creche |
| `questionarios.html` | Bateria da faixa etária, com exemplo preenchível e o que muda à medida que cresce |
| `mensagens.html` | Canal escrito com a equipa e quem tem acesso à área da criança |
| `recursos.html` | Vídeos para pais com LGP e legendas, documentos para a creche, perguntas frequentes |

**Área clínica** (`area-profissional/`)

| Página | Para quê |
|---|---|
| `dashboard.html` | Todos os doentes por fase, com uso diário e estado do percurso |
| `doente.html` | Ficha completa: preferências de comunicação primeiro, depois percurso, audiologia, datalogging, adesão e registo da programação |
| `alertas.html` | O que não pode esperar pela próxima reunião, com a ação concreta e as regras ativas |
| `reuniao.html` | Cada caso da reunião multidisciplinar numa página, com o que falta a vermelho e a decisão registada em ata |
| `instrumentos.html` | Catálogo de PROMs por faixa etária: o que usar, com quem, quando, e o estado da versão portuguesa |
| `indicadores.html` | Tempos por fase, resultados, adesão e qualidade dos compromissos de acessibilidade |

## 5. Regras de alerta propostas

| Regra | Condição | Nível |
|---|---|---|
| Uso insuficiente do processador | Média < 6 h/dia durante 3 semanas, no primeiro ano | alerta |
| Candidatura parada | Etapa sem progresso há mais de 90 dias | alerta |
| Prova de próteses sem reavaliação | Fim da prova há mais de 60 dias sem campo livre | alerta |
| Queda de desempenho | Discriminação vocal desce mais de 15 pontos entre avaliações | alerta |
| Consulta sem intérprete atribuído | Doente utilizador de LGP com consulta a menos de 7 dias | aviso |
| PROM por responder | Questionário enviado há mais de 7 dias sem resposta | aviso |
| Prioridade pediátrica | Criança < 18 meses em lista cirúrgica há mais de 30 dias | informação |

Os limiares são propostas de partida — servem para a equipa discordar com números à frente.

## 6. Que questionários usar (PROMs)

Catálogo completo em `assets/js/proms.js`, apresentado em
`area-profissional/instrumentos.html`. Três regras o orientaram:

1. **Núcleo curto.** Um instrumento específico de audição + um genérico de qualidade de vida
   + satisfação. Tudo o resto é modular, pedido só a quem tem a queixa correspondente. Cada
   instrumento acrescentado ao núcleo baixa a taxa de resposta de todos os outros.
2. **Quem responde faz parte do dado.** Até aos 6 anos responde o cuidador; dos 6 aos 12 a
   criança com apoio na leitura; a partir dos 13 o próprio. Uma série que misture proxy com
   autorreporte sem o registar não é comparável — por isso `respostas_questionario` guarda
   `papel_respondente`, `idade_meses` e `idade_auditiva_meses`.
3. **Acessível ou não conta.** Sem vídeo em LGP por pergunta e versão em linguagem clara, o
   questionário mede literacia e não audição.

**Adultos (≥ 18 anos)** — responde sempre o próprio

| | Instrumentos |
|---|---|
| Núcleo | **CIQOL-10 Global** (qualidade de vida específica do implante) · **SSQ12** (audição na vida real) · **EQ-5D-5L** (genérico, permite QALY e defesa do programa) · satisfação com o centro |
| Modular | **NCIQ** (retrato completo, só no basal e aos 12 meses) · **APHAB** (durante a prova de próteses) · **IOI-CI** (7 itens, seguimento anual) · **THI** (acufeno) · **DHI** (tontura) · **HADS** (ansiedade e depressão) · escala de esforço e fadiga auditiva |

**Pediatria (0-17 anos)** — o respondente muda com a idade

| Faixa | Quem responde | Instrumentos |
|---|---|---|
| 0-2 anos (orientar pela **idade auditiva**) | Pais | **LittlEARS** (tem curva normativa por idade auditiva) · **IT-MAIS** · **PEACH** · PedsQL Infant |
| 3-5 anos | Pais e educadora | **MAIS/MUSS** · **PEACH/TEACH** · **CCIPP** (perspetiva parental sobre o implante) · PedsQL 2-4 |
| 6-12 anos | A criança, com apoio + pais + professor | **HEAR-QL-26** · PedsQL 8-12 (versão da criança **e** dos pais) · **SSQ-C/SSQ-P** · **TEACH** · escala de fadiga auditiva |
| 13-17 anos | O próprio adolescente | **HEAR-QL-28** · PedsQL 13-18 · **SSQ12** (a partir dos 14) · **CIQOL-10** (a partir dos 16, para atravessar a transição sem quebra de série) · questionário de preparação para a transição |

**Não são PROMs, mas entram no mesmo painel:** CAP-II e SIR (atribuídos pelo clínico),
datalogging do processador e testes vocais em cabine. Vale a pena mantê-los separados —
quando divergem do que o doente relata, é aí que está a informação clínica mais útil.

> **Antes de adotar qualquer um:** confirmar a existência de versão portuguesa validada (não
> basta traduzir) e o regime de licença — PedsQL exige licença, EQ-5D e LittlEARS exigem
> registo, e para CIQOL e HEAR-QL é preciso contactar os autores. O estado indicado no
> catálogo é indicativo e precisa de verificação caso a caso.

## 7. Modelo de dados

`database/schema.sql` esboça as tabelas (PostgreSQL/Supabase, como no Fénix):

- `doentes`, `perfis`, **`preferencias_comunicacao`** (tabela própria, porque é consultada
  por marcações, mensagens, lembretes e alertas — sem ela a plataforma telefona a quem não ouve)
- `etapas_modelo` + `jornada_doente` — o percurso-modelo e a cópia de cada doente
- `avaliacoes_audiologicas` (tonal em `jsonb`, vocal no silêncio e no ruído)
- `implantes`, `processadores`, `programacoes` (com o datalogging de cada sessão)
- `planos_reabilitacao`, `exercicios`, `registos_exercicio`, `diario_escuta`
- `questionarios`, `respostas_questionario`
- `marcacoes` (com `apoio_pedido` e `apoio_garantido`), `mensagens`
- `reunioes`, `decisoes_candidatura`
- `alertas`, `auditoria_acessos`, e o esboço das políticas de RLS

## 8. Como ver

Abrir `index.html` num browser (duplo clique chega — não precisa de servidor). A partir daí:
**Ver a área do doente** e **Ver a área clínica** entram diretamente; não há autenticação
neste esboço.

```
CREIC/
├── index.html              apresentação + ecrã de acesso
├── area-doente/            área do adulto · 8 páginas
├── area-familia/           área da família 0-18 · 7 páginas
├── area-profissional/      área clínica · 6 páginas
├── assets/css/styles.css   design system
├── assets/js/dados.js      dados fictícios do percurso adulto
├── assets/js/dados-pediatria.js  jornada 0-18, marcos de linguagem, criança demo
├── assets/js/proms.js      catálogo de questionários por faixa etária
├── assets/js/app.js        cabeçalho, menu, onda da jornada, gráficos em SVG
├── assets/img/             logótipo SoundBirth (lockup, ícone e favicon, PNG transparente)
└── database/schema.sql     esboço do modelo de dados
```

Sem dependências externas além das fontes Google (Fraunces + IBM Plex). Os gráficos —
audiograma, uso diário, discriminação — são SVG gerado à mão, sem biblioteca.

## 9. O que este esboço **não** é

- Não tem autenticação, base de dados nem backend: os dados estão todos em `dados.js`.
- Não tem validação clínica: critérios de candidatura, limiares e protocolos de avaliação
  são plausíveis, não oficiais. Têm de ser revistos pela equipa do CREIC e alinhados com as
  normas da DGS e o regulamento do centro.
- Não trata do RGPD na prática (consentimentos, prazos de conservação, DPIA).
- Os nomes, processos e resultados são inventados.

## 10. Decisões em aberto para a equipa

1. **Fronteira do percurso pediátrico.** A jornada da criança começa no rastreio auditivo
   neonatal (como está esboçado) ou só na referenciação ao CREIC? Se começar no rastreio, o
   centro assume visibilidade sobre um período em que ainda não é responsável pelo caso.
2. **Bateria final de PROMs.** O catálogo da secção 6 é uma proposta. Falta a equipa fixar o
   núcleo, confirmar versões portuguesas validadas e tratar licenças — é o item com prazo
   mais longo depois dos conteúdos em LGP.
3. **A transição aos 18 anos.** Em que idade o jovem passa a ter conta própria (aqui, 16), o
   que acontece ao histórico respondido pelos pais, e o que os pais continuam a ver depois
   dos 18 se ele não se opuser.
4. **Quem responde às mensagens, e em que prazo?** O compromisso de 48 h úteis tem de ter
   dono: gestor de caso, secretariado clínico, ou escala da equipa.
5. **Datalogging.** Leitura manual na consulta (como está esboçado) ou integração com o
   software do fabricante? A integração muda o valor de metade dos alertas.
6. **Acesso da creche e da escola.** Aqui a educadora vê apenas o relatório escolar, sem
   dados clínicos. É preciso decidir o que a escola vê, quem autoriza e com que registo.
7. **Conteúdos em LGP.** Produção própria, parceria com associações de surdos, ou
   licenciamento? É o item com maior custo e maior prazo de todo o projeto.
8. **Intérpretes.** Bolsa interna, contrato externo ou serviço de videointerpretação —
   define se o pedido na marcação é uma promessa que o centro consegue cumprir.

## 11. Caminho sugerido

| Fase | O quê |
|---|---|
| A | Validar com a equipa o modelo da jornada e as regras de alerta (este esboço serve de base de discussão) |
| B | Área clínica com base de dados real: doentes, jornada, alertas e reunião multidisciplinar |
| C | Área do doente: jornada, marcações, mensagens e questionários |
| D | Audiologia estruturada: avaliações, programações e datalogging |
| E | Reabilitação e conteúdos acessíveis (LGP, legendas, transcrições) |
| F | Indicadores do centro e exportação para relatório de atividade |

---

*Esboço v0.1 · setembro de 2026 · conteúdo e dados fictícios, sem valor clínico.*
