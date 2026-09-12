/* ========================================================================
   SOUNDBIRTH — percurso pediátrico (0 aos 18 anos)
   Dados fictícios. O percurso da criança não é o do adulto encurtado: começa
   no rastreio auditivo neonatal, corre contra o relógio da plasticidade
   auditiva, envolve a família e a escola, e termina numa transição para a
   área de adulto.
   ======================================================================== */

/* ------------------------------------------------------------------
   1. MODELO DA JORNADA PEDIÁTRICA
   ------------------------------------------------------------------ */
CREIC.jornadaPediatrica = [
  {
    fase: 'Deteção e diagnóstico',
    curto: 'Deteção',
    resumo: 'A regra 1-3-6: rastreio até ao 1.º mês, diagnóstico até aos 3, intervenção até aos 6.',
    etapas: [
      { id:'p_rastreio',    titulo:'Rastreio auditivo neonatal universal', quem:'Maternidade',          prazo:'1.º mês de vida',  nota:'Otoemissões e/ou PEATC automático antes da alta da maternidade.' },
      { id:'p_reteste',     titulo:'Reteste e referenciação',              quem:'ORL de origem',        prazo:'até 1 mês',        nota:'Um rastreio que não passa não é diagnóstico — confirma-se sempre.' },
      { id:'p_diagnostico', titulo:'Diagnóstico audiológico',             quem:'Audiologia do CREIC',  prazo:'até aos 3 meses',  nota:'PEATC por frequências, ASSR, otoemissões e impedanciometria, com sono natural ou sedação.' }
    ]
  },
  {
    fase: 'Intervenção precoce e próteses',
    curto: 'Intervenção',
    resumo: 'Antes do implante, garantir estimulação: próteses adaptadas e apoio à família desde o primeiro mês.',
    etapas: [
      { id:'p_protese',  titulo:'Adaptação de próteses auditivas',     quem:'Audiologia',            prazo:'até aos 6 meses', nota:'Ganho verificado em orelha real (RECD); moldes substituídos à medida que a orelha cresce.' },
      { id:'p_precoce',  titulo:'Intervenção precoce e apoio à família', quem:'Terapia da fala / SNIPI', prazo:'imediato',     nota:'A família aprende a criar ambiente de linguagem — é o fator que mais pesa no resultado.' },
      { id:'p_modo',     titulo:'Escolha informada do modo de comunicação', quem:'Equipa + família',  prazo:'contínuo',        nota:'Oral, bilingue (LGP + oral) ou gestual: decisão da família, revista ao longo do tempo, sem ser imposta.' }
    ]
  },
  {
    fase: 'Estudo de candidatura',
    curto: 'Candidatura',
    resumo: 'Em pediatria o estudo é mais largo: causa, síndromes associados, visão e desenvolvimento.',
    etapas: [
      { id:'p_imagem',   titulo:'TC dos ossos temporais e RM',            quem:'Neurorradiologia',           prazo:'até 45 dias',  nota:'Malformações da cóclea, nervo coclear e aqueduto vestibular alargado.' },
      { id:'p_genetica', titulo:'Estudo genético e etiológico',           quem:'Genética',                   prazo:'variável',     nota:'GJB2/GJB6 e painel alargado; orienta prognóstico e aconselhamento aos pais.' },
      { id:'p_oftalmo',  titulo:'Avaliação oftalmológica',               quem:'Oftalmologia',               prazo:'até 60 dias',  nota:'Exclui síndrome de Usher e garante a visão — que é o canal de aprendizagem enquanto não ouve.' },
      { id:'p_desenv',   titulo:'Avaliação do desenvolvimento e linguagem', quem:'Terapia da fala / Pediatria', prazo:'até 45 dias', nota:'Marcos de desenvolvimento, comunicação pré-verbal e perturbações associadas.' },
      { id:'p_psico',    titulo:'Avaliação de psicologia e da família',   quem:'Psicologia',                 prazo:'até 45 dias',  nota:'Expectativas, capacidade de adesão à reabilitação e suporte social.' },
      { id:'p_preop',    titulo:'Avaliação pré-operatória e vacinação',   quem:'Pediatria / Anestesiologia', prazo:'antes da cirurgia', nota:'Vacinação antipneumocócica completa antes da implantação.' }
    ]
  },
  {
    fase: 'Decisão e cirurgia',
    curto: 'Cirurgia',
    resumo: 'O tempo é o fator crítico: implantar cedo, e em regra os dois ouvidos ao mesmo tempo.',
    etapas: [
      { id:'p_reuniao',  titulo:'Reunião do grupo de implante coclear', quem:'Equipa multidisciplinar', prazo:'quinzenal', nota:'Decide candidatura, lateralidade e prioridade na lista.' },
      { id:'p_consent',  titulo:'Consulta de decisão e consentimento',  quem:'ORL + gestor de caso',    prazo:'até 15 dias', nota:'Consentimento dos dois detentores das responsabilidades parentais; a criança é ouvida conforme a idade.' },
      { id:'p_cirurgia', titulo:'Cirurgia de implantação',              quem:'ORL / Bloco pediátrico',  prazo:'idealmente antes dos 12-18 meses', nota:'Bilateral simultânea sempre que indicado: uma só anestesia, audição nos dois lados desde o início.' }
    ]
  },
  {
    fase: 'Ativação e programação',
    curto: 'Ativação',
    resumo: 'A criança não diz se está confortável: programa-se com medidas objetivas e observação dos pais.',
    etapas: [
      { id:'p_ativacao', titulo:'Ativação dos processadores', quem:'Audiologia pediátrica', prazo:'3 a 4 semanas após a cirurgia', nota:'Primeiro mapa apoiado em telemetria e reflexo estapédico; ensino do uso e da retenção.' },
      { id:'p_maps',     titulo:'Programações frequentes',    quem:'Audiologia pediátrica', prazo:'mensal no 1.º ano, depois trimestral', nota:'Audiometria condicionada por reforço visual/lúdica conforme a idade.' }
    ]
  },
  {
    fase: 'Reabilitação, creche e escola',
    curto: 'Escola',
    resumo: 'O implante funciona onde a criança vive: em casa, na creche e na sala de aula.',
    etapas: [
      { id:'p_tav',      titulo:'Terapia auditivo-verbal',            quem:'Terapia da fala',        prazo:'semanal',   nota:'Com a família presente na sessão: quem treina a criança todos os dias são os pais.' },
      { id:'p_escola',   titulo:'Articulação com creche e escola',    quem:'Gestor de caso + EMAEI', prazo:'cada ano letivo', nota:'Sistema FM/microfone remoto, acústica da sala, lugar, e medidas de suporte à aprendizagem.' },
      { id:'p_lgp',      titulo:'Acesso a LGP e a pares',             quem:'Equipa + associações',   prazo:'contínuo',  nota:'Direito da criança surda ao contacto com a comunidade surda, independentemente de ouvir com o implante.' }
    ]
  },
  {
    fase: 'Resultados e transição',
    curto: 'Transição',
    resumo: 'Avaliar linguagem, não só audição — e preparar a passagem para a área de adulto.',
    etapas: [
      { id:'p_resultados', titulo:'Avaliação de resultados e da linguagem', quem:'Audiologia + terapia da fala', prazo:'3, 6, 12 meses e depois anual', nota:'Perceção da fala adequada à idade, desenvolvimento da linguagem e questionários aos pais.' },
      { id:'p_longo',      titulo:'Seguimento anual e atualizações',        quem:'Equipa do CREIC',              prazo:'anual',        nota:'Upgrade do processador, moldes, acessórios e reavaliação escolar.' },
      { id:'p_transicao',  titulo:'Transição para a área de adulto',        quem:'Equipa do CREIC',              prazo:'entre os 16 e os 18 anos', nota:'O jovem passa a responder por si: consultas, questionários e decisões deixam de ser dos pais.' }
    ]
  }
];

/* ------------------------------------------------------------------
   2. CRIANÇA DE DEMONSTRAÇÃO (área da família)
   ------------------------------------------------------------------ */
CREIC.crianca = {
  nome: 'Laura Pinto Esteves',
  tratamento: 'Laura',
  processo: 'CREIC-0147',
  nascimento: '14 Ago 2023',
  idade: '3 anos',
  idadeAuditiva: '2 anos e 1 mês',      // tempo desde a ativação — é esta que conta
  diagnostico: 'Surdez congénita neurossensorial bilateral profunda (GJB2)',
  lado: 'Implante bilateral simultâneo, colocado aos 11 meses',
  gestor: 'Enf.ª Rita Moura · gestora de caso',
  responsaveis: 'Marta Pinto (mãe) e Hugo Esteves (pai)',
  comunicacao: {
    canal: 'Mensagem escrita na plataforma + SMS para a mãe',
    nunca: 'Chamada telefónica durante o horário da creche',
    lgp: true,
    interprete: false,
    nota: 'Família em abordagem bilingue: oral em casa, LGP com a educadora de surdos uma vez por semana.'
  },
  etapaAtual: 'p_tav',
  estados: {
    p_rastreio:'feito', p_reteste:'feito', p_diagnostico:'feito',
    p_protese:'feito', p_precoce:'feito', p_modo:'feito',
    p_imagem:'feito', p_genetica:'feito', p_oftalmo:'feito', p_desenv:'feito', p_psico:'feito', p_preop:'feito',
    p_reuniao:'feito', p_consent:'feito', p_cirurgia:'feito',
    p_ativacao:'feito', p_maps:'ativo',
    p_tav:'ativo', p_escola:'ativo', p_lgp:'ativo',
    p_resultados:'ativo', p_longo:'previsto', p_transicao:'previsto'
  },
  datas: {
    p_rastreio:'16 Ago 2023', p_reteste:'05 Set 2023', p_diagnostico:'12 Out 2023',
    p_protese:'02 Nov 2023', p_precoce:'Nov 2023', p_modo:'Jan 2024',
    p_imagem:'22 Jan 2024', p_genetica:'Fev 2024', p_oftalmo:'29 Fev 2024',
    p_desenv:'06 Mar 2024', p_psico:'13 Mar 2024', p_preop:'02 Mai 2024',
    p_reuniao:'21 Mai 2024', p_consent:'04 Jun 2024', p_cirurgia:'16 Jul 2024',
    p_ativacao:'08 Ago 2024', p_maps:'próxima: 29 Set 2026',
    p_tav:'semanal, 5.ª feira', p_escola:'ano letivo 2026/27', p_lgp:'em curso',
    p_resultados:'próxima: Out 2026', p_longo:'anual', p_transicao:'2039-2041'
  }
};

/* marcos de linguagem — o que se acompanha numa criança, além da audição */
CREIC.marcosLinguagem = [
  { marco:'Reage ao nome',                     idadeAuditiva:'3 meses',  estado:'atingido', quando:'Nov 2024' },
  { marco:'Balbucio com consoantes variadas',  idadeAuditiva:'6 meses',  estado:'atingido', quando:'Fev 2025' },
  { marco:'Primeiras palavras com significado', idadeAuditiva:'12 meses', estado:'atingido', quando:'Ago 2025' },
  { marco:'Junta duas palavras',               idadeAuditiva:'18 meses', estado:'atingido', quando:'Mar 2026' },
  { marco:'Frases de três ou mais palavras',   idadeAuditiva:'24 meses', estado:'em curso', quando:'—' },
  { marco:'Conversa com pares na creche',      idadeAuditiva:'30 meses', estado:'previsto', quando:'—' }
];

/* uso diário dos processadores (média dos dois lados, horas/dia por mês) */
CREIC.usoCrianca = [6.8, 8.1, 9.4, 10.2, 10.9, 11.4];

/* próximas marcações da família */
CREIC.marcacoesCrianca = [
  { data:'29 Set 2026, 14h00', tipo:'Terapia auditivo-verbal — sessão semanal', local:'CREIC · Gabinete 4',          quem:'Terapia da fala', interprete:false, estado:'confirmada' },
  { data:'13 Out 2026, 10h00', tipo:'Programação dos processadores',            local:'CREIC · Audiologia pediátrica', quem:'Audiologia',    interprete:false, estado:'confirmada' },
  { data:'22 Out 2026, 09h30', tipo:'Reunião com a creche (EMAEI)',             local:'Creche · sala dos 3 anos',     quem:'Gestão de caso', interprete:true,  estado:'por confirmar' }
];

/* treino em casa desta semana — em pediatria o treino é brincadeira dirigida */
CREIC.exerciciosCrianca = [
  { titulo:'Sons de Ling em jogo (a, i, u, ch, s, m)', freq:'todos os dias, ao pequeno-almoço', feito:6, alvo:7, nota:'Tape a boca com a mão e veja se a Laura reage a cada som.' },
  { titulo:'Ler um livro juntos, a nomear figuras',     freq:'todos os dias, antes de dormir',   feito:7, alvo:7, nota:'Repetir e esperar: dar tempo para ela responder.' },
  { titulo:'Falar durante as rotinas (banho, refeição)', freq:'contínuo',                         feito:5, alvo:7, nota:'Narrar o que está a acontecer: é assim que se constrói vocabulário.' },
  { titulo:'Escutar sem ver: chamar de outra divisão',   freq:'3x/semana',                        feito:2, alvo:3, nota:'Ajuda a perceber se ouve à distância e com ruído de fundo.' }
];
