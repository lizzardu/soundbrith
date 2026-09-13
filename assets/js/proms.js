/* ========================================================================
   SOUNDBIRTH — catálogo de referência de PROMs, PREMs e expectativas
   (página area-profissional/instrumentos.html)

   O catálogo operacional — o que se envia e responde — está na tabela
   `questionarios` (database/02_catalogo.sql). Este ficheiro explica as
   escolhas: porquê cada instrumento, com que evidência, e o que mudou depois
   da leitura dos artigos da pasta ULSSJ/PROM/cochlear implants.

   Quatro regras:
   1. Específico antes de genérico. Instrumentos genéricos detetam metade do
      efeito do implante (SMD 0,79 vs 1,69–1,82 nos específicos) e os testes
      de fala explicam só 10–20% da qualidade de vida genérica e 5–6% da
      específica (McRackan et al., 2018).
   2. Núcleo curto; o resto é modular.
   3. Quem responde faz parte do dado (proxy ≠ autorreporte).
   4. Expectativas medidas antes, resultados medidos depois, nos mesmos
      domínios — só assim se sabe se foram cumpridas (McRackan et al., 2022).
   ======================================================================== */

window.CREIC = window.CREIC || {};

window.CREIC.proms = {

  mudancas: [
    { de: 'EQ-5D-5L no núcleo', para: 'HUI-3 no núcleo (EQ-5D-5L opcional)',
      porque: 'O EQ-5D e o SF-36 não têm dimensão de audição nem itens de fatores ambientais (Kartal Ozcan et al., 2026); o HUI-3 deteta o efeito do implante (SMD 0,84) e foi a base dos QALY na análise custo-benefício (McRackan et al., 2018; Neve et al., 2021).' },
    { de: 'NCIQ como perfil detalhado', para: 'CIQOL-35 Profile (NCIQ só para séries antigas)',
      porque: 'O NCIQ é o mais usado (58% dos estudos) mas tem 60 itens, fadiga de resposta e dúvidas de precisão; o CIQOL-35 cobre as três componentes da CIF com 35 itens e melhores propriedades (Kartal Ozcan et al., 2026).' },
    { de: 'Sem medida de expectativas', para: 'CIQOL-Expectations na candidatura, comparado com normas',
      porque: 'Os candidatos esperam mais do que os utilizadores experientes conseguem em comunicação e esforço auditivo; as expectativas mudam com o aconselhamento (McRackan et al., 2022).' },
    { de: 'Atualização do processador só por testes de fala', para: 'APHAB + APSQ antes e 4 semanas depois, com diferença mínima relevante',
      porque: '35–42% dos doentes têm benefício relevante nos PROMs sem ganho nos testes vocais (Lailach et al., 2023).' },
    { de: 'Música fora da avaliação', para: 'MuRQoL a partir dos 12 anos, com fator de reabilitação',
      porque: 'Identificou vontade de reabilitação musical em 63% dos doentes, sem correlação relevante com os testes audiológicos (Frosolini et al., 2022).' },
    { de: 'Satisfação genérica', para: 'PREM do centro + resultados sociais (emprego, escolaridade)',
      porque: 'A OCDE recomenda PREMs; os modelos de cuidados raramente medem experiência ou resultados sociais (Ebrahimi-Madiseh et al., 2023). O benefício social do implante está sobretudo na escolaridade e no emprego (Neve et al., 2021).' }
  ],

  adulto: {
    nucleo: [
      { sigla: 'CIQOL-10 Global', nome: 'Cochlear Implant Quality of Life — 10 Global', itens: 10, tempo: '3 min',
        momentos: 'Candidatura · 3 · 6 · 12 meses · anual', icf: ['F', 'A', 'E'],
        porque: 'Desenhado com utilizadores de implante e metodologia PROMIS. Curto o bastante para repetir em todos os marcos.',
        estadoPT: 'sem versão portuguesa validada conhecida: tradução e adaptação necessárias' },
      { sigla: 'SSQ12', nome: 'Speech, Spatial and Qualities of Hearing Scale — curta', itens: 12, tempo: '6 min',
        momentos: 'Candidatura · 3 · 6 · 12 meses · anual', icf: ['F', 'A'],
        porque: 'A linguagem comum dos centros de implante: permite comparar com a literatura.',
        estadoPT: 'versão portuguesa em uso (confirmar a adotada)' },
      { sigla: 'HUI-3', nome: 'Health Utilities Index Mark 3', itens: 15, tempo: '5 min',
        momentos: 'Candidatura · 12 meses · anual', icf: ['F'],
        porque: 'Utilidade para QALY com atributo de audição: é o genérico que deteta o implante e o que sustenta análises de custo.',
        estadoPT: 'confirmar versão portuguesa; licença paga' },
      { sigla: 'PREM', nome: 'Experiência com o CREIC (instrumento local)', itens: 6, tempo: '2 min',
        momentos: 'Após cada marco do percurso', icf: ['E'],
        porque: 'Mede o que o centro controla: informação, comunicação acessível, intérprete, tempos de resposta, decisão partilhada.',
        estadoPT: 'original em português' }
    ],
    candidatura: [
      { sigla: 'CIQOL-Expectations', nome: 'CIQOL — Expectativas', itens: 35, tempo: '10 min',
        momentos: 'Antes e depois da consulta de aconselhamento', icf: ['F', 'A', 'E'],
        porque: 'Mesmos seis domínios do CIQOL-35, na forma "vou conseguir". A plataforma compara cada domínio com a média + 1 DP de 705 utilizadores experientes e avisa quando está acima.',
        estadoPT: 'sem versão portuguesa validada conhecida; gratuito com manual (MUSC)' },
      { sigla: 'APHAB', nome: 'Abbreviated Profile of Hearing Aid Benefit', itens: 24, tempo: '8 min',
        momentos: 'Início e fim da prova de próteses', icf: ['F', 'A', 'E'],
        porque: 'Documenta, do ponto de vista do doente, o benefício insuficiente com prótese bem adaptada.',
        estadoPT: 'confirmar versão portuguesa' },
      { sigla: 'HADS', nome: 'Hospital Anxiety and Depression Scale', itens: 14, tempo: '5 min',
        momentos: 'Candidatura · 12 meses', icf: ['F'],
        porque: 'Com a psicologia: a surdez adquirida isola, e o humor pesa na adesão à reabilitação.',
        estadoPT: 'versão portuguesa validada; licença' }
    ],
    modular: [
      { sigla: 'CIQOL-35 Profile', nome: 'CIQOL — perfil de 35 itens', itens: 35, tempo: '10 min',
        momentos: 'Candidatura · 12 meses', icf: ['F', 'A', 'E'],
        porque: 'Perfil detalhado por domínio; é contra ele que se lê se as expectativas foram cumpridas.',
        estadoPT: 'sem versão portuguesa validada conhecida' },
      { sigla: 'APHAB + APSQ', nome: 'Benefício + satisfação com o processador', itens: '24 + 15', tempo: '13 min',
        momentos: 'Atualização: processador antigo e 4 semanas com o novo', icf: ['A', 'E'],
        porque: 'Diferenças mínimas relevantes: APHAB ≥ 3,8 pp, APSQ ≥ 0,74. A plataforma aplica a regra e mostra se o benefício só aparece nos PROMs.',
        estadoPT: 'APHAB: confirmar; APSQ: validado em alemão, versão portuguesa por fazer' },
      { sigla: 'MuRQoL', nome: 'Music-Related Quality of Life', itens: 36, tempo: '10 min',
        momentos: '12 meses · anual', icf: ['A', 'E'],
        porque: 'Frequência e importância da música em espelho; fator de reabilitação = importância − frequência. Alerta a partir de 1.',
        estadoPT: 'versão italiana validada; portuguesa por fazer' },
      { sigla: 'Esforço auditivo', nome: 'Escala de esforço e fadiga (instrumento local)', itens: 4, tempo: '2 min',
        momentos: 'Candidatura · 6 · 12 meses', icf: ['F', 'A'],
        porque: 'O domínio onde as expectativas mais se afastam do resultado; os testes de cabine não o captam.',
        estadoPT: 'original em português' },
      { sigla: 'THI', nome: 'Tinnitus Handicap Inventory', itens: 25, tempo: '7 min',
        momentos: 'Candidatura · 6 · 12 meses, com acufeno', icf: ['F', 'A'],
        porque: 'O acufeno costuma melhorar com o implante; sem medir, a melhoria não fica registada.',
        estadoPT: 'versão portuguesa validada' },
      { sigla: 'DHI', nome: 'Dizziness Handicap Inventory', itens: 25, tempo: '7 min',
        momentos: 'Antes da cirurgia · 3 meses, com risco vestibular', icf: ['F', 'A'],
        porque: 'Medir antes protege o doente e o centro.',
        estadoPT: 'versão portuguesa validada' },
      { sigla: 'EQ-5D-5L', nome: 'EuroQol 5 dimensões', itens: 6, tempo: '2 min',
        momentos: 'Opcional', icf: ['F', 'A'],
        porque: 'Só para comparação com outras patologias e dados nacionais: subestima o benefício do implante.',
        estadoPT: 'versão portuguesa validada; registo EuroQol' },
      { sigla: 'NCIQ', nome: 'Nijmegen Cochlear Implant Questionnaire', itens: 60, tempo: '15 min',
        momentos: 'Só para continuar séries antigas', icf: ['F', 'A', 'E'],
        porque: 'Cobre 14 de 22 subdomínios da CIF, mas é longo e com dúvidas de precisão de medida.',
        estadoPT: 'versão portuguesa disponível (confirmar)' }
    ]
  },

  pediatria: [
    { faixa: '0 aos 2 anos', idadeRef: 'orientar pela idade auditiva (tempo desde a ativação)', quem: 'Pais ou cuidadores',
      instrumentos: [
        { sigla: 'LittlEARS', nome: 'LittlEARS Auditory Questionnaire', itens: 35, quem: 'Pais', momentos: 'Basal · mensal no 1.º ano de audição', icf: ['F', 'A'],
          porque: 'Curva normativa por idade auditiva: sinaliza cedo quem não progride.', estadoPT: 'disponível (confirmar edição e registo)' },
        { sigla: 'IT-MAIS', nome: 'Infant-Toddler Meaningful Auditory Integration Scale', itens: 10, quem: 'Pais, em entrevista', momentos: 'Basal · 3 · 6 · 12 meses', icf: ['F', 'A'],
          porque: 'Entrevista estruturada: funciona com baixa literacia.', estadoPT: 'em uso (confirmar)' },
        { sigla: 'PEACH', nome: 'Parents Evaluation of Aural/Oral Performance of Children', itens: 13, quem: 'Pais', momentos: '3 · 6 · 12 meses · anual', icf: ['A', 'E'],
          porque: 'Exemplos concretos da última semana, em silêncio e em ruído.', estadoPT: 'confirmar' },
        { sigla: 'PREM (família)', nome: 'Experiência da família com o CREIC', itens: 6, quem: 'Pais', momentos: 'Após cada marco', icf: ['E'],
          porque: 'Inclui a articulação com creche e escola.', estadoPT: 'original em português' }
      ] },
    { faixa: '3 aos 5 anos', idadeRef: 'pré-escolar', quem: 'Pais e educadora',
      instrumentos: [
        { sigla: 'MAIS / MUSS', nome: 'Meaningful Auditory Integration / Use of Speech', itens: 20, quem: 'Pais', momentos: '6 · 12 meses · anual', icf: ['F', 'A'],
          porque: 'Continuação do IT-MAIS.', estadoPT: 'em uso (confirmar)' },
        { sigla: 'PEACH / TEACH', nome: 'Desempenho em casa e na creche', itens: '13 + 11', quem: 'Pais e educadora', momentos: 'Início do ano letivo · anual', icf: ['A', 'E'],
          porque: 'A educadora vê a criança em ruído e com pares.', estadoPT: 'confirmar' },
        { sigla: 'CCIPP', nome: 'Children with Cochlear Implants: Parental Perspectives', itens: 74, quem: 'Pais', momentos: '12 meses · a cada 2 anos', icf: ['A', 'E'],
          porque: 'Pergunta pelo processo de decisão e pelo apoio recebido.', estadoPT: 'confirmar' },
        { sigla: 'PedsQL 2–4', nome: 'PedsQL 4.0 Generic Core', itens: 21, quem: 'Pais', momentos: 'Anual', icf: ['F', 'A'],
          porque: 'Série genérica comparável ao longo da infância.', estadoPT: 'validada; licença' }
      ] },
    { faixa: '6 aos 12 anos', idadeRef: 'idade escolar', quem: 'A criança com apoio, os pais e o professor',
      instrumentos: [
        { sigla: 'HEAR-QL-26', nome: 'Qualidade de vida na perda auditiva (7–12)', itens: 26, quem: 'Criança', momentos: 'Basal · 6 · 12 meses · anual', icf: ['A', 'E'],
          porque: 'A criança passa a ser a melhor fonte sobre a sua vida.', estadoPT: 'confirmar' },
        { sigla: 'PedsQL 8–12', nome: 'PedsQL 4.0 (criança e pais)', itens: 23, quem: 'Criança + pais', momentos: 'Anual', icf: ['F', 'A'],
          porque: 'As duas versões mostram a diferença entre o que a criança sente e o que os pais julgam.', estadoPT: 'validada; licença' },
        { sigla: 'TEACH', nome: 'Desempenho na sala de aula', itens: 11, quem: 'Professor', momentos: 'Início e fim do ano letivo', icf: ['A', 'E'],
          porque: 'A sala de aula é o pior ambiente acústico da vida da criança.', estadoPT: 'confirmar' },
        { sigla: 'VFS-Peds', nome: 'Fadiga relacionada com a audição', itens: 10, quem: 'Criança, pais, professor', momentos: 'Anual', icf: ['F', 'A'],
          porque: 'Sem medir, confunde-se fadiga com desinteresse.', estadoPT: 'confirmar' }
      ] },
    { faixa: '12 aos 17 anos', idadeRef: 'adolescência e preparação da transição', quem: 'O próprio (os pais complementam)',
      instrumentos: [
        { sigla: 'HEAR-QL-28', nome: 'Qualidade de vida na perda auditiva (13–18)', itens: 28, quem: 'Adolescente', momentos: 'Anual', icf: ['A', 'E'],
          porque: 'Pares, ruído social, identidade e uso do dispositivo em público.', estadoPT: 'confirmar' },
        { sigla: 'MuRQoL', nome: 'Music-Related Quality of Life', itens: 36, quem: 'Adolescente', momentos: 'Anual, a partir dos 12 anos', icf: ['A', 'E'],
          porque: 'Já aplicado a adolescentes a partir dos 12 anos (Frosolini et al., 2022).', estadoPT: 'portuguesa por fazer' },
        { sigla: 'SSQ12 e CIQOL-10', nome: 'Instrumentos de adulto introduzidos antes da transição', itens: '12 + 10', quem: 'Adolescente', momentos: 'SSQ12 desde os 14 · CIQOL-10 desde os 16', icf: ['F', 'A', 'E'],
          porque: 'Começar antes cria uma linha de base que atravessa a mudança de área sem quebra de série.', estadoPT: 'ver adulto' },
        { sigla: 'Transição', nome: 'Preparação para a área de adulto (instrumento local)', itens: 6, quem: 'Adolescente', momentos: '16 e 17 anos', icf: ['A', 'E'],
          porque: 'A transição falha quando o jovem chega à área de adulto sem nunca ter falado por si.', estadoPT: 'original em português' }
      ] }
  ],

  observadas: [
    { sigla: 'Testes vocais', nome: 'Discriminação no silêncio e no ruído', mede: 'Percentagem de palavras e frases compreendidas em cabine; SRT no ruído.' },
    { sigla: 'Datalogging', nome: 'Horas de uso do processador', mede: 'Uso real por dia, lido do dispositivo em cada programação.' },
    { sigla: 'CAP-II e SIR', nome: 'Categories of Auditory Performance · Speech Intelligibility Rating', mede: 'Escalas atribuídas pelo clínico em pediatria.' },
    { sigla: 'Resultados sociais', nome: 'Situação profissional e escolaridade', mede: 'Registados na candidatura e anualmente. Base do benefício social (Neve et al., 2021).' }
  ],

  momentos: [
    { quando: 'Candidatura (basal)', adulto: 'CIQOL-10, SSQ12, HUI-3, CIQOL-35, APHAB no início e fim da prova; HADS; esforço auditivo; situação profissional', pediatria: 'Instrumentos da faixa etária; PedsQL; escolaridade' },
    { quando: 'Aconselhamento pré-implante', adulto: 'CIQOL-Expectations antes e depois da consulta', pediatria: '— (não validado em pediatria)' },
    { quando: 'Antes da cirurgia', adulto: 'DHI se risco vestibular', pediatria: '—' },
    { quando: 'Ativação', adulto: '—', pediatria: 'LittlEARS (início da idade auditiva)' },
    { quando: '3 e 6 meses', adulto: 'CIQOL-10, SSQ12; PREM após o marco', pediatria: 'IT-MAIS/MAIS, PEACH; PREM família' },
    { quando: '12 meses', adulto: 'CIQOL-10, CIQOL-35 (lido contra as expectativas), SSQ12, HUI-3, MuRQoL, PREM, situação profissional', pediatria: 'Bateria da faixa + CCIPP; escolaridade' },
    { quando: 'Anual', adulto: 'CIQOL-10, HUI-3, situação profissional', pediatria: 'Faixa etária + TEACH no início do ano letivo' },
    { quando: 'Atualização do processador', adulto: 'Testes vocais + APHAB + APSQ, antes e 4 semanas depois', pediatria: 'Testes adequados à idade + questionários da faixa' }
  ]
};


