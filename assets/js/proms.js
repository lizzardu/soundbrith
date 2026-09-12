/* ========================================================================
   SOUNDBIRTH — catálogo de PROMs (resultados reportados pelo doente)

   Proposta de bateria para discussão com a equipa do CREIC, não uma lista
   fechada. Três regras orientaram a escolha:

   1. Núcleo curto. Um instrumento específico de audição + um genérico de
      qualidade de vida + satisfação. Tudo o resto é modular, pedido só a
      quem tem a queixa correspondente. Baterias longas não se respondem.
   2. Quem responde faz parte do dado. Abaixo dos 6 anos responde o pai, a
      mãe ou o cuidador (proxy); dos 6 aos 12 responde a criança com apoio;
      a partir dos 13 responde o próprio. Misturar proxy e autorreporte na
      mesma série torna a comparação inútil.
   3. Acessível ou não conta. Um questionário escrito só em português
      corrente, entregue a quem não ouve e comunica em LGP, mede literacia
      e não audição. Todos os instrumentos precisam de vídeo em LGP e de
      versão em linguagem clara.

   estadoPT: situação da versão portuguesa — a confirmar caso a caso com a
   equipa antes de qualquer utilização (algumas exigem licença ou registo).
   ======================================================================== */

CREIC.proms = {

  /* ------------------------------------------------------------------
     ADULTOS — 18 anos ou mais. Responde sempre o próprio.
     ------------------------------------------------------------------ */
  adulto: {
    nucleo: [
      { sigla:'CIQOL-10 Global', nome:'Cochlear Implant Quality of Life — versão global',
        mede:'Qualidade de vida específica de quem usa implante coclear', itens:10, tempo:'3 min',
        momentos:'Candidatura · 3 · 6 · 12 meses · anual',
        porque:'Foi desenhado de raiz para adultos implantados, com metodologia moderna de desenvolvimento de instrumentos. É o mais sensível à mudança que o implante realmente produz.',
        estadoPT:'versão portuguesa a confirmar com os autores' },
      { sigla:'SSQ12', nome:'Speech, Spatial and Qualities of Hearing Scale — versão curta',
        mede:'Audição na vida real: conversa, ruído, localização do som, esforço', itens:12, tempo:'6 min',
        momentos:'Candidatura · 3 · 6 · 12 meses · anual',
        porque:'É a linguagem comum dos centros de implante: permite comparar resultados com a literatura e com outros centros.',
        estadoPT:'versão portuguesa em uso corrente' },
      { sigla:'EQ-5D-5L', nome:'EuroQol 5 dimensões',
        mede:'Qualidade de vida genérica, convertível em anos de vida ajustados (QALY)', itens:'5 + escala visual', tempo:'2 min',
        momentos:'Candidatura · 12 meses · anual',
        porque:'É o que permite defender o programa perante quem financia: sem uma medida genérica não se demonstra custo-efetividade nem se compara com outras patologias.',
        estadoPT:'versão portuguesa validada; registo junto da EuroQol' },
      { sigla:'Satisfação CREIC', nome:'Experiência com o centro',
        mede:'Informação recebida, acessibilidade da comunicação, tempos de espera', itens:6, tempo:'2 min',
        momentos:'Após cada marco do percurso',
        porque:'Mede o que o centro controla — e é o único instrumento que deteta falhas de acessibilidade antes de elas gerarem abandono.',
        estadoPT:'instrumento local, a construir' }
    ],
    modular: [
      { sigla:'NCIQ', nome:'Nijmegen Cochlear Implant Questionnaire',
        mede:'Seis domínios: perceção sonora básica e avançada, produção de fala, autoestima, atividade e interação social', itens:60, tempo:'15 min',
        momentos:'Candidatura · 12 meses',
        porque:'Detalhado demais para repetir com frequência, mas é o retrato mais completo do antes e depois. Usar só duas vezes.',
        estadoPT:'versão portuguesa disponível' },
      { sigla:'APHAB', nome:'Abbreviated Profile of Hearing Aid Benefit',
        mede:'Benefício das próteses auditivas em quatro situações do dia a dia', itens:24, tempo:'8 min',
        momentos:'Durante a prova de próteses (fase de candidatura)',
        porque:'Documenta o benefício insuficiente com prótese bem adaptada — que é precisamente o que sustenta a indicação para implante.',
        estadoPT:'versão portuguesa disponível' },
      { sigla:'IOI-CI', nome:'International Outcome Inventory adaptado ao implante',
        mede:'Uso, benefício, limitações, satisfação, impacto nos outros', itens:7, tempo:'2 min',
        momentos:'12 meses · anual',
        porque:'Sete perguntas para o seguimento de longo prazo, quando já não faz sentido repetir baterias longas.',
        estadoPT:'adaptação do IOI-HA; versão a confirmar' },
      { sigla:'THI', nome:'Tinnitus Handicap Inventory',
        mede:'Impacto do acufeno no dia a dia', itens:25, tempo:'7 min',
        momentos:'Candidatura · 6 · 12 meses — só com queixa de acufeno',
        porque:'O acufeno é queixa muito frequente na surdez severa e costuma melhorar com o implante. Se não for medido, essa melhoria não aparece em lado nenhum.',
        estadoPT:'versão portuguesa validada' },
      { sigla:'DHI', nome:'Dizziness Handicap Inventory',
        mede:'Impacto da tontura e do desequilíbrio', itens:25, tempo:'7 min',
        momentos:'Pré-cirurgia · 3 meses — só com queixa ou risco vestibular',
        porque:'A cirurgia pode afetar a função vestibular. Medir antes protege o doente e o centro.',
        estadoPT:'versão portuguesa validada' },
      { sigla:'HADS', nome:'Hospital Anxiety and Depression Scale',
        mede:'Sintomas de ansiedade e depressão', itens:14, tempo:'5 min',
        momentos:'Candidatura · 12 meses — articulado com a psicologia',
        porque:'A surdez adquirida no adulto isola. É um dado clínico, não um extra — e identifica quem precisa de acompanhamento antes da cirurgia.',
        estadoPT:'versão portuguesa validada' },
      { sigla:'Esforço auditivo', nome:'Escala de esforço e fadiga auditiva',
        mede:'Cansaço ao fim do dia por causa do esforço para ouvir', itens:'escala visual + 4 itens', tempo:'2 min',
        momentos:'Candidatura · 6 · 12 meses',
        porque:'Muitos doentes percebem bem nos testes e mesmo assim chegam exaustos ao fim do dia. É a queixa que os testes de cabine não captam.',
        estadoPT:'escala visual analógica, sem necessidade de validação formal' }
    ]
  },

  /* ------------------------------------------------------------------
     PEDIATRIA — 0 aos 18 anos, por faixa etária.
     Nos mais novos o instrumento mede o que os pais observam; a criança
     só entra como respondente quando tem competência para isso.
     ------------------------------------------------------------------ */
  pediatria: [
    {
      faixa: '0 aos 2 anos',
      idadeRef: 'orientar pela idade auditiva (tempo desde a ativação), não pela idade civil',
      quem: 'Pais ou cuidadores (proxy)',
      instrumentos: [
        { sigla:'LittlEARS', nome:'LittlEARS Auditory Questionnaire', mede:'Desenvolvimento do comportamento auditivo no primeiro ano de audição', itens:35, quem:'Pais',
          momentos:'Basal · mensal no 1.º ano de idade auditiva', porque:'Tem curva normativa por idade auditiva: mostra se a criança está a progredir ao ritmo esperado, e sinaliza cedo quando não está.', estadoPT:'versão portuguesa disponível (registo junto do editor)' },
        { sigla:'IT-MAIS', nome:'Infant-Toddler Meaningful Auditory Integration Scale', mede:'Vocalização, alerta ao som e atribuição de significado aos sons', itens:10, quem:'Pais, em entrevista',
          momentos:'Basal · 3 · 6 · 12 meses', porque:'Entrevista estruturada — funciona mesmo com famílias com baixa literacia.', estadoPT:'versão portuguesa em uso' },
        { sigla:'PEACH', nome:'Parents Evaluation of Aural/Oral performance of Children', mede:'Desempenho auditivo em situações reais, no silêncio e no ruído', itens:13, quem:'Pais',
          momentos:'3 · 6 · 12 meses · anual', porque:'Obriga os pais a dar exemplos concretos da última semana, o que reduz a resposta por impressão geral.', estadoPT:'versão portuguesa a confirmar' },
        { sigla:'PedsQL Infant', nome:'PedsQL Infant Scales', mede:'Qualidade de vida global do bebé', itens:'36-45', quem:'Pais',
          momentos:'Basal · 12 meses', porque:'Medida genérica que permite comparar com outras condições pediátricas.', estadoPT:'versão portuguesa validada; licença necessária' }
      ]
    },
    {
      faixa: '3 aos 5 anos',
      idadeRef: 'pré-escolar',
      quem: 'Pais e educadora de infância',
      instrumentos: [
        { sigla:'MAIS / MUSS', nome:'Meaningful Auditory Integration Scale / Meaningful Use of Speech Scale', mede:'Integração auditiva e uso da fala com intenção comunicativa', itens:'10 + 10', quem:'Pais',
          momentos:'6 · 12 meses · anual', porque:'Continuação natural do IT-MAIS quando a criança cresce.', estadoPT:'versão portuguesa em uso' },
        { sigla:'PEACH / TEACH', nome:'Parents/Teachers Evaluation of Aural performance', mede:'Desempenho em casa (PEACH) e na creche ou jardim de infância (TEACH)', itens:'13 + 11', quem:'Pais e educadora',
          momentos:'Início de cada ano letivo · anual', porque:'A educadora vê a criança em ruído e com pares — situações que os pais não observam.', estadoPT:'versão portuguesa a confirmar' },
        { sigla:'CCIPP', nome:'Children with Cochlear Implants: Parental Perspectives', mede:'Oito domínios da perspetiva dos pais: comunicação, autoestima, apoio, decisão, efeitos do implante', itens:74, quem:'Pais',
          momentos:'12 meses · a cada 2 anos', porque:'É o único que pergunta aos pais o que mudou na família, incluindo o arrependimento ou a confirmação da decisão.', estadoPT:'versão portuguesa a confirmar' },
        { sigla:'PedsQL 2-4', nome:'PedsQL 4.0 Generic Core (pré-escolar)', mede:'Qualidade de vida genérica', itens:21, quem:'Pais',
          momentos:'Anual', porque:'Mantém a série genérica comparável ao longo de toda a infância.', estadoPT:'versão portuguesa validada; licença necessária' }
      ]
    },
    {
      faixa: '6 aos 12 anos',
      idadeRef: 'idade escolar',
      quem: 'A criança (com apoio na leitura), os pais e o professor',
      instrumentos: [
        { sigla:'HEAR-QL-26', nome:'Hearing Environments and Reflection on Quality of Life (7-12 anos)', mede:'Qualidade de vida específica da perda auditiva, na voz da criança', itens:26, quem:'Criança',
          momentos:'Basal · 6 · 12 meses · anual', porque:'É aqui que a criança começa a ser a melhor fonte sobre a sua própria vida — e as respostas dela divergem frequentemente das dos pais.', estadoPT:'versão portuguesa a confirmar' },
        { sigla:'PedsQL 8-12', nome:'PedsQL 4.0 Generic Core', mede:'Qualidade de vida genérica, em versão da criança e dos pais', itens:23, quem:'Criança + pais (as duas)',
          momentos:'Anual', porque:'Responder as duas versões mostra a diferença entre o que a criança sente e o que os pais julgam que ela sente.', estadoPT:'versão portuguesa validada; licença necessária' },
        { sigla:'SSQ-C / SSQ-P', nome:'SSQ para crianças e para pais', mede:'Audição no dia a dia: conversa, ruído, localização', itens:'~20', quem:'Criança e pais',
          momentos:'Anual', porque:'Liga a série pediátrica ao SSQ12 usado no adulto, o que dá continuidade de medida ao longo da vida.', estadoPT:'versão portuguesa a confirmar' },
        { sigla:'TEACH', nome:'Teachers Evaluation of Aural performance of Children', mede:'Desempenho auditivo na sala de aula', itens:11, quem:'Professor',
          momentos:'Início e fim de cada ano letivo', porque:'A sala de aula é o pior ambiente acústico da vida da criança e o mais determinante para a aprendizagem.', estadoPT:'versão portuguesa a confirmar' },
        { sigla:'Fadiga auditiva', nome:'Escala de fadiga relacionada com a audição (versões criança, pais e professor)', mede:'Cansaço causado pelo esforço de escutar ao longo do dia escolar', itens:'~15', quem:'Criança, pais e professor',
          momentos:'Anual', porque:'A criança implantada ouve — e chega a casa esgotada. Sem medir, confunde-se fadiga com desinteresse ou mau comportamento.', estadoPT:'versão portuguesa a confirmar' }
      ]
    },
    {
      faixa: '13 aos 17 anos',
      idadeRef: 'adolescência e preparação da transição',
      quem: 'O próprio adolescente (os pais passam a complementar, não a substituir)',
      instrumentos: [
        { sigla:'HEAR-QL-28', nome:'HEAR-QL para adolescentes (13-18 anos)', mede:'Qualidade de vida específica da perda auditiva na adolescência', itens:28, quem:'Adolescente',
          momentos:'Anual', porque:'Cobre o que pesa nesta idade: grupo de pares, ruído social, identidade e uso ou não uso do dispositivo em público.', estadoPT:'versão portuguesa a confirmar' },
        { sigla:'PedsQL 13-18', nome:'PedsQL 4.0 Generic Core', mede:'Qualidade de vida genérica', itens:23, quem:'Adolescente',
          momentos:'Anual', porque:'Fecha a série genérica iniciada na primeira infância.', estadoPT:'versão portuguesa validada; licença necessária' },
        { sigla:'SSQ12', nome:'Speech, Spatial and Qualities of Hearing Scale — versão curta', mede:'Audição na vida real', itens:12, quem:'Adolescente',
          momentos:'Anual, a partir dos 14 anos', porque:'Começar cedo o instrumento do adulto cria uma linha de base que atravessa a transição sem quebra.', estadoPT:'versão portuguesa em uso corrente' },
        { sigla:'CIQOL-10 Global', nome:'Cochlear Implant Quality of Life — versão global', mede:'Qualidade de vida específica do implante', itens:10, quem:'Adolescente',
          momentos:'A partir dos 16 anos, anual', porque:'Introduzido dois anos antes da transição, dá continuidade à medida quando o jovem passa para a área de adulto.', estadoPT:'versão portuguesa a confirmar' },
        { sigla:'Transição', nome:'Questionário de preparação para a transição', mede:'Autonomia: sabe explicar o seu diagnóstico, marcar consultas, resolver avarias, pedir apoio', itens:10, quem:'Adolescente',
          momentos:'16 e 17 anos', porque:'A transição falha quando o jovem chega à área de adulto sem nunca ter falado por si. Isto mede-o antes de acontecer.', estadoPT:'instrumento local, a construir' }
      ]
    }
  ],

  /* medidas que a equipa observa — não são PROMs, mas completam o retrato */
  observadas: [
    { sigla:'CAP-II',  nome:'Categories of Auditory Performance', mede:'Escala de 0 a 9 do desempenho auditivo funcional, atribuída pelo clínico' },
    { sigla:'SIR',     nome:'Speech Intelligibility Rating',      mede:'Inteligibilidade da fala da criança para um ouvinte não familiarizado, de 1 a 5' },
    { sigla:'Datalogging', nome:'Horas de uso do processador',    mede:'Uso real por dia, lido do dispositivo — o preditor isolado mais forte do resultado' },
    { sigla:'Testes vocais', nome:'Discriminação no silêncio e no ruído', mede:'Percentagem de palavras e frases compreendidas em cabine' }
  ],

  /* quando se recolhe */
  momentos: [
    { quando:'Candidatura (basal)', adulto:'CIQOL-10, SSQ12, EQ-5D-5L, APHAB, + módulos conforme queixa', pediatria:'LittlEARS ou faixa correspondente, PedsQL, PEACH' },
    { quando:'Pré-cirurgia',        adulto:'DHI se risco vestibular',                                      pediatria:'—' },
    { quando:'Ativação',            adulto:'—',                                                            pediatria:'LittlEARS (início da contagem da idade auditiva)' },
    { quando:'3 meses',             adulto:'CIQOL-10, SSQ12',                                              pediatria:'IT-MAIS/MAIS, PEACH' },
    { quando:'6 meses',             adulto:'CIQOL-10, SSQ12, THI se acufeno',                              pediatria:'Faixa correspondente + HEAR-QL a partir dos 7 anos' },
    { quando:'12 meses',            adulto:'Bateria completa: CIQOL, SSQ12, NCIQ, EQ-5D-5L, IOI-CI, HADS', pediatria:'Bateria completa da faixa + CCIPP' },
    { quando:'Anual',               adulto:'CIQOL-10, IOI-CI, EQ-5D-5L',                                   pediatria:'Faixa correspondente + TEACH no início do ano letivo' }
  ]
};
