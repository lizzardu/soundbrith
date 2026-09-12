/* ========================================================================
   ESCUTA — dados fictícios do esboço
   Nada aqui é real: serve apenas para o protótipo ter conteúdo credível.
   Em produção, cada bloco deste ficheiro corresponde a uma tabela
   (ver database/schema.sql).
   ======================================================================== */

const CREIC = {};

/* ------------------------------------------------------------------
   1. MODELO DA JORNADA — as fases e etapas por onde passa qualquer
   candidato a implante coclear. É o esqueleto clínico da plataforma:
   o percurso individual de cada doente é uma cópia deste modelo com
   datas, estados e responsáveis preenchidos.
   ------------------------------------------------------------------ */
CREIC.jornadaModelo = [
  {
    fase: 'Referenciação e primeira avaliação',
    curto: 'Referenciação',
    resumo: 'Da suspeita de surdez à caracterização audiológica completa.',
    etapas: [
      { id:'ref',    titulo:'Referenciação ao CREIC',        quem:'Médico assistente / ORL de origem', prazo:'—',           nota:'Entrada por consulta externa, rastreio auditivo neonatal ou referenciação interna.' },
      { id:'orl1',   titulo:'Primeira consulta de ORL',      quem:'ORL do CREIC',                      prazo:'até 60 dias', nota:'História clínica, otoscopia e definição do plano de estudo.' },
      { id:'audio1', titulo:'Avaliação audiológica de base', quem:'Audiologia',                        prazo:'até 30 dias', nota:'Audiograma tonal e vocal, impedanciometria, otoemissões e PEATC quando indicado.' }
    ]
  },
  {
    fase: 'Otimização protésica e estudo de candidatura',
    curto: 'Candidatura',
    resumo: 'Só é candidato quem, com próteses bem adaptadas, continua sem benefício suficiente.',
    etapas: [
      { id:'protese',   titulo:'Adaptação e otimização de próteses auditivas', quem:'Audiologia',                     prazo:'3 meses de prova',  nota:'Período de prova documentado, com verificação em orelha real.' },
      { id:'campo',     titulo:'Reavaliação em campo livre com prótese',       quem:'Audiologia',                     prazo:'fim da prova',      nota:'Ganho funcional e discriminação vocal com prótese — a medida que sustenta a decisão.' },
      { id:'imagem',    titulo:'TC dos ossos temporais e RM',                  quem:'Neurorradiologia',               prazo:'até 45 dias',       nota:'Permeabilidade coclear, malformações e presença do nervo coclear.' },
      { id:'etiologia', titulo:'Estudo etiológico e genético',                 quem:'ORL / Genética',                 prazo:'variável',          nota:'Orienta o prognóstico e o aconselhamento familiar.' },
      { id:'fala',      titulo:'Avaliação de terapia da fala e linguagem',     quem:'Terapia da fala',                prazo:'até 45 dias',       nota:'Perfil comunicativo, modo de comunicação preferido e potencial de reabilitação.' },
      { id:'psico',     titulo:'Avaliação de psicologia e expectativas',       quem:'Psicologia',                     prazo:'até 45 dias',       nota:'Motivação, suporte familiar e expectativas realistas sobre o resultado.' },
      { id:'preop',    titulo:'Avaliação pré-operatória e vacinação',          quem:'Anestesiologia / Saúde pública', prazo:'antes da cirurgia', nota:'Risco anestésico e vacinação antipneumocócica.' }
    ]
  },
  {
    fase: 'Decisão',
    curto: 'Decisão',
    resumo: 'A candidatura é decidida em equipa e explicada ao doente com tempo.',
    etapas: [
      { id:'reuniao', titulo:'Reunião do grupo de implante coclear', quem:'Equipa multidisciplinar', prazo:'quinzenal',   nota:'Decisão registada em ata: candidato, não candidato, ou em estudo.' },
      { id:'decisao', titulo:'Consulta de decisão partilhada',       quem:'ORL + gestor de caso',    prazo:'até 15 dias', nota:'Escolha do lado e do dispositivo, riscos e benefícios, consentimento informado.' },
      { id:'lista',   titulo:'Inscrição em lista cirúrgica',         quem:'Secretariado clínico',    prazo:'—',           nota:'Entrada na lista com a prioridade definida pela equipa.' }
    ]
  },
  {
    fase: 'Cirurgia',
    curto: 'Cirurgia',
    resumo: 'O implante é colocado; o processador só é ligado semanas depois.',
    etapas: [
      { id:'cirurgia', titulo:'Cirurgia de implantação',          quem:'ORL / Bloco operatório', prazo:'—',           nota:'A telemetria intraoperatória confirma o funcionamento dos elétrodos.' },
      { id:'penso',    titulo:'Consulta de penso e cicatrização', quem:'Enfermagem / ORL',       prazo:'7 a 10 dias', nota:'Avaliação da ferida e ensino de cuidados.' }
    ]
  },
  {
    fase: 'Ativação e programação',
    curto: 'Ativação',
    resumo: 'O som chega no dia da ativação — e depois é afinado sessão a sessão.',
    etapas: [
      { id:'ativacao', titulo:'Ativação do processador', quem:'Audiologia', prazo:'3 a 4 semanas após a cirurgia',      nota:'Primeiro mapa (MAP), ensino do dispositivo e da sua manutenção.' },
      { id:'maps',     titulo:'Programações seriadas',   quem:'Audiologia', prazo:'1 sem · 1 mês · 3 · 6 · 12 meses',  nota:'Ajuste de níveis, leitura do datalogging e resolução de queixas.' }
    ]
  },
  {
    fase: 'Reabilitação e resultados',
    curto: 'Reabilitação',
    resumo: 'O implante dá acesso ao som; a reabilitação é que transforma som em significado.',
    etapas: [
      { id:'reabilitacao', titulo:'Reabilitação auditiva e terapia da fala',  quem:'Terapia da fala',     prazo:'semanal ou quinzenal', nota:'Plano individual com treino em casa e registo de progresso.' },
      { id:'resultados',   titulo:'Avaliação de resultados 3 / 6 / 12 meses', quem:'Audiologia + equipa', prazo:'marcos fixos',         nota:'Discriminação no silêncio e no ruído, questionários e horas de uso.' },
      { id:'longo',        titulo:'Seguimento a longo prazo',                 quem:'Equipa do CREIC',     prazo:'anual',                nota:'Manutenção, atualização do processador e avaliação de segundo implante.' }
    ]
  }
];

/* ------------------------------------------------------------------
   2. DOENTE DE DEMONSTRAÇÃO (área do doente)
   ------------------------------------------------------------------ */
CREIC.doente = {
  nome: 'Manuel Torres Ribeiro',
  processo: 'CREIC-0142',
  idade: 61,
  diagnostico: 'Hipoacusia neurossensorial bilateral profunda, progressiva',
  lado: 'Implante à direita',
  gestor: 'Enf.ª Rita Moura · gestora de caso',
  // preferências de comunicação: o campo mais importante de todo o perfil
  comunicacao: {
    canal: 'Mensagem escrita na plataforma + SMS',
    nunca: 'Chamada telefónica',
    lgp: false,
    interprete: false,
    leituraLabial: true,
    nota: 'Prefere texto simples e frases curtas. Acompanhado pela filha nas consultas.'
  },
  etapaAtual: 'maps',
  estados: {
    ref:'feito', orl1:'feito', audio1:'feito',
    protese:'feito', campo:'feito', imagem:'feito', etiologia:'feito',
    fala:'feito', psico:'feito', preop:'feito',
    reuniao:'feito', decisao:'feito', lista:'feito',
    cirurgia:'feito', penso:'feito',
    ativacao:'feito', maps:'ativo',
    reabilitacao:'ativo', resultados:'previsto', longo:'previsto'
  },
  datas: {
    ref:'12 Set 2024', orl1:'08 Nov 2024', audio1:'21 Nov 2024',
    protese:'Dez 2024 a Mar 2025', campo:'18 Mar 2025', imagem:'02 Abr 2025', etiologia:'Abr 2025',
    fala:'10 Abr 2025', psico:'15 Abr 2025', preop:'06 Mai 2026',
    reuniao:'21 Mai 2025', decisao:'04 Jun 2025', lista:'04 Jun 2025',
    cirurgia:'09 Jul 2026', penso:'18 Jul 2026',
    ativacao:'06 Ago 2026', maps:'próxima: 24 Set 2026',
    reabilitacao:'em curso', resultados:'Nov 2026', longo:'2027'
  }
};

/* próximas marcações do doente de demonstração */
CREIC.marcacoes = [
  { data:'24 Set 2026, 10h30', tipo:'Programação do processador (MAP 3 meses)', local:'CREIC · Sala de Audiologia 2', quem:'Audiologia',      interprete:false, estado:'confirmada' },
  { data:'01 Out 2026, 15h00', tipo:'Reabilitação auditiva — sessão 12',        local:'CREIC · Gabinete 4',           quem:'Terapia da fala', interprete:false, estado:'confirmada' },
  { data:'12 Nov 2026, 09h00', tipo:'Avaliação de resultados aos 3 meses',      local:'CREIC · Cabine audiométrica',  quem:'Audiologia',      interprete:false, estado:'por confirmar' }
];

/* uso diário do processador, lido do datalogging (horas/dia, semanas desde a ativação) */
CREIC.usoDiario = [4.1, 5.6, 6.2, 7.4, 8.2, 9.0];

/* discriminação vocal em campo livre (%) */
CREIC.discriminacao = [
  { marco:'Pré-implante (com prótese)', silencio:18, ruido:4 },
  { marco:'Ativação',                   silencio:26, ruido:8 },
  { marco:'1 mês',                      silencio:44, ruido:14 }
];

/* audiograma em campo livre: antes (com prótese) e depois (com implante) */
CREIC.audiograma = {
  frequencias: [250, 500, 1000, 2000, 4000, 8000],
  comProtese:  [75, 80, 85, 95, 105, 110],
  comImplante: [30, 30, 25, 30, 35, 45]
};

/* plano de reabilitação — exercícios da semana */
CREIC.exercicios = [
  { titulo:'Deteção dos sons de Ling (a, i, u, ch, s, m)', freq:'2x/dia, 5 min', feito:5, alvo:7, nota:'Peça a alguém para os dizer sem que veja a boca.' },
  { titulo:'Escuta de audiolivro com o texto à frente',    freq:'20 min/dia',    feito:4, alvo:7, nota:'Ler enquanto ouve liga o som à palavra.' },
  { titulo:'Conversa por videochamada com pessoa conhecida', freq:'2x/semana',   feito:1, alvo:2, nota:'Comece por temas previsíveis e combinados antes.' },
  { titulo:'Discriminação de pares mínimos (pato/gato)',   freq:'3x/semana',     feito:3, alvo:3, nota:'Aplicação de treino indicada pela terapeuta.' }
];

/* questionários (PROMs) do adulto */
CREIC.questionarios = [
  { nome:'SSQ12 — audição no dia a dia',          quando:'Pré-implante, 3, 6 e 12 meses', estado:'por responder', prazo:'até 30 Set 2026' },
  { nome:'NCIQ — qualidade de vida com implante', quando:'Pré-implante, 6 e 12 meses',    estado:'respondido',    prazo:'06 Ago 2026' },
  { nome:'Diário de escuta',                      quando:'Semanal',                       estado:'respondido',    prazo:'15 Set 2026' },
  { nome:'Satisfação com o CREIC',                quando:'Após cada marco',               estado:'por responder', prazo:'até 31 Out 2026' }
];

/* mensagens com a equipa */
CREIC.mensagens = [
  { de:'equipa', quem:'Enf.ª Rita Moura · gestora de caso', quando:'15 Set, 09h12', texto:'Bom dia, Sr. Manuel. A sua programação de 3 meses fica marcada para 24 de setembro, às 10h30. Traga o processador e os acessórios. Responda aqui se precisar de mudar a hora.' },
  { de:'eu',     quem:'Eu',                                 quando:'15 Set, 18h40', texto:'Boa tarde. Fica bem a essa hora. Tenho notado um apito quando ponho o processador de manhã. É normal?' },
  { de:'equipa', quem:'Dra. Inês Câmara · audiologista',     quando:'16 Set, 08h55', texto:'Esse apito costuma ser o íman a assentar mal. Até dia 24 experimente desligar, voltar a colocar e verificar a bateria. Se piorar, escreva aqui que antecipamos a consulta.' }
];

/* ------------------------------------------------------------------
   3. LISTA DE DOENTES (área profissional)
   ------------------------------------------------------------------ */
CREIC.listaDoentes = [
  { processo:'CREIC-0142', nome:'Manuel Torres Ribeiro',   idade:61, tipo:'Adulto',    fase:'Ativação e programação',    etapa:'Programações seriadas',         desde:'Set 2024', uso:9.0,  risco:'ok',     lgp:false, proximo:'24 Set · MAP 3 meses' },
  { processo:'CREIC-0147', nome:'Laura Pinto Esteves',     idade:3,  tipo:'Pediatria', fase:'Reabilitação e resultados', etapa:'Terapia auditivo-verbal',       desde:'Jan 2024', uso:11.4, risco:'ok',     lgp:false, proximo:'29 Set · Terapia da fala' },
  { processo:'CREIC-0151', nome:'Joaquim Nunes Bastos',    idade:74, tipo:'Adulto',    fase:'Otimização protésica',      etapa:'Prova de próteses (3 meses)',   desde:'Mar 2026', uso:null, risco:'atraso', lgp:false, proximo:'02 Out · Campo livre' },
  { processo:'CREIC-0153', nome:'Sofia Marques Lima',      idade:29, tipo:'Adulto',    fase:'Decisão',                   etapa:'Reunião do grupo de IC',        desde:'Fev 2026', uso:null, risco:'ok',     lgp:true,  proximo:'26 Set · Reunião MD' },
  { processo:'CREIC-0158', nome:'Tomás Ferreira Alves',    idade:1,  tipo:'Pediatria', fase:'Cirurgia',                  etapa:'Inscrito em lista cirúrgica',   desde:'Abr 2026', uso:null, risco:'ok',     lgp:false, proximo:'Lista · prioridade alta' },
  { processo:'CREIC-0160', nome:'Amélia Duarte Rocha',     idade:68, tipo:'Adulto',    fase:'Ativação e programação',    etapa:'Pós-ativação (1 mês)',          desde:'Nov 2025', uso:3.2,  risco:'alerta', lgp:false, proximo:'23 Set · MAP urgente' },
  { processo:'CREIC-0163', nome:'Rui Baptista Coelho',     idade:52, tipo:'Adulto',    fase:'Referenciação',             etapa:'Avaliação audiológica de base', desde:'Ago 2026', uso:null, risco:'ok',     lgp:false, proximo:'30 Set · Audiologia' },
  { processo:'CREIC-0164', nome:'Beatriz Santos Nogueira', idade:6,  tipo:'Pediatria', fase:'Reabilitação e resultados', etapa:'Avaliação dos 12 meses',        desde:'Set 2025', uso:10.1, risco:'ok',     lgp:true,  proximo:'07 Out · Resultados' }
];

/* alertas clínicos gerados pela plataforma */
CREIC.alertas = [
  { nivel:'alerta', doente:'Amélia Duarte Rocha', processo:'CREIC-0160', titulo:'Uso diário do processador abaixo de 4 h',
    detalhe:'Média de 3,2 h/dia nas últimas 3 semanas (datalogging). O uso baixo no primeiro ano é o maior preditor de mau resultado.',
    quando:'há 2 dias', accao:'Contactar e antecipar programação' },
  { nivel:'alerta', doente:'Joaquim Nunes Bastos', processo:'CREIC-0151', titulo:'Prova de próteses sem reavaliação há 5 meses',
    detalhe:'A prova documentada de 3 meses terminou em Jul 2026 e não há reavaliação em campo livre. A candidatura está parada.',
    quando:'há 6 dias', accao:'Marcar campo livre' },
  { nivel:'aviso', doente:'Sofia Marques Lima', processo:'CREIC-0153', titulo:'Consulta sem intérprete de LGP atribuído',
    detalhe:'Doente utilizadora de LGP com consulta a 26 Set sem pedido de intérprete registado.',
    quando:'há 1 dia', accao:'Pedir intérprete' },
  { nivel:'aviso', doente:'Manuel Torres Ribeiro', processo:'CREIC-0142', titulo:'SSQ12 dos 3 meses por responder',
    detalhe:'Questionário enviado há 9 dias, sem resposta. É necessário antes da avaliação de resultados.',
    quando:'há 9 dias', accao:'Reenviar lembrete' },
  { nivel:'info', doente:'Tomás Ferreira Alves', processo:'CREIC-0158', titulo:'Critério de idade: implantar antes dos 18 meses',
    detalhe:'Aguarda cirurgia há 42 dias. A janela de plasticidade auditiva recomenda prioridade.',
    quando:'há 3 dias', accao:'Rever prioridade na lista' }
];

/* próxima reunião multidisciplinar */
CREIC.reuniao = {
  data: '26 de setembro de 2026, 14h00',
  local: 'CREIC · sala de reuniões (e por videochamada)',
  presentes: ['ORL', 'Audiologia', 'Terapia da fala', 'Psicologia', 'Neurorradiologia', 'Gestão de caso'],
  casos: [
    { processo:'CREIC-0153', nome:'Sofia Marques Lima', idade:29,
      sintese:'Surdez neurossensorial bilateral profunda pós-meningite aos 24 anos. Utilizadora de LGP; leitura labial eficaz.',
      audiologia:'Discriminação vocal com prótese: 12% à direita, 8% à esquerda. Ganho funcional insuficiente após 4 meses de prova.',
      imagem:'TC e RM sem ossificação coclear. Nervos cocleares presentes bilateralmente.',
      fala:'Boa competência linguística prévia. Expectativas realistas.',
      psico:'Motivada, com suporte familiar presente. Sem contraindicação.',
      proposta:'Candidata a implante unilateral direito', pendente:null },
    { processo:'CREIC-0151', nome:'Joaquim Nunes Bastos', idade:74,
      sintese:'Hipoacusia progressiva bilateral, presbiacusia avançada. Vive sozinho.',
      audiologia:'Prova de próteses terminada em Jul 2026, sem reavaliação em campo livre.',
      imagem:'TC pedida, por realizar.',
      fala:'Avaliação agendada.',
      psico:'Avaliação agendada. A ponderar apoio domiciliário para a manutenção do dispositivo.',
      proposta:'Adiar decisão', pendente:'Campo livre + TC + avaliações de terapia da fala e psicologia' },
    { processo:'CREIC-0158', nome:'Tomás Ferreira Alves', idade:1,
      sintese:'Surdez congénita profunda bilateral, detetada no rastreio auditivo neonatal. Mutação GJB2 confirmada.',
      audiologia:'PEATC sem respostas até 95 dB. Sem benefício com próteses após 4 meses.',
      imagem:'Cócleas normoformadas.',
      fala:'Família em programa de intervenção precoce desde os 4 meses.',
      psico:'Família informada e aderente.',
      proposta:'Implantação bilateral simultânea, prioridade alta', pendente:null }
  ]
};

/* indicadores do centro */
CREIC.indicadores = {
  emSeguimento: 128,
  candidaturasEmEstudo: 23,
  listaCirurgica: 11,
  esperaMediaRefCirurgia: '11,4 meses',
  usoMedioDiario: '9,1 h/dia',
  discriminacaoMedia12m: '68%',
  taxaResposta: '74%'
};
