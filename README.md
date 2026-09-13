# SoundBirth — plataforma de acompanhamento do CREIC

Acompanhamento da jornada do doente com surdez e indicação para implante coclear, da
referenciação ao seguimento a longo prazo. Site estático (HTML/CSS/JS) no GitHub Pages, com
login e base de dados no **Supabase** — a mesma arquitetura do projeto Fénix.

> **Protótipo, sem valor clínico.** Critérios, prazos e limiares de alerta são propostas para
> a equipa discutir. Não usar com dados de doentes reais — ver secção 9.

**Para pôr a funcionar:** [GUIA-SUPABASE.md](GUIA-SUPABASE.md).
**Evidência que sustenta as escolhas:** [evidencia.html](evidencia.html).

---

## 1. O que resolve

1. **O doente não sabe onde está.** A espera sem explicação lê-se como abandono.
2. **A candidatura pára sem que ninguém veja.** Falta uma TC, uma reavaliação, uma consulta
   de psicologia — e o caso só volta à luz na reunião seguinte.
3. **O resultado decide-se depois da cirurgia.** Horas de uso diário, reabilitação e
   questionários mostram o problema meses antes da consulta.

E um princípio que condiciona tudo: **os utilizadores não ouvem.** Comunicação escrita por
omissão, preferência de comunicação (LGP, leitura labial, transcrição, intérprete) no topo da
ficha e transportada para cada marcação, alerta quando falta intérprete, alertas visuais e
nunca sonoros.

## 2. Dois acessos

| | **Profissional** | **Utilizador** |
|---|---|---|
| Quem é | Equipa do CREIC | O doente adulto, ou os pais/tutores da criança |
| Como obtém conta | Criada pela administração no Supabase (`03_primeiro_profissional.sql`) | Ativa-a sozinho com o **código de 8 caracteres** que a equipa lhe entrega |
| O que vê | Todos os doentes | Só o seu doente |
| Área | `area-profissional/` | `area-adulto/` **ou** `area-pediatrica/` |

**O grupo é decidido pelo profissional.** Ao registar o doente, escolhe *adulto* ou
*pediátrico*; é isso — e não a data de nascimento — que determina a jornada criada e a área
que o utilizador vê ao entrar. Pode ser mudado na ficha (ex. transição aos 18 anos): as etapas
do grupo anterior ficam no histórico.

Fluxo: profissional regista o doente → recebe o código (mostrado uma vez) → entrega-o por
escrito → o utilizador abre **Recebi um código de acesso**, põe email, password e código →
entra diretamente na sua área.

A página redireciona quem não pertence ali, mas a proteção real está na base de dados:
**Row Level Security** em todas as tabelas, com `is_profissional()` e `meu_doente_id()`.

## 3. As duas jornadas

Cada doente recebe uma cópia do percurso do seu grupo (`etapas_modelo` → `jornada_doente`),
com datas, estado e responsável. Cada etapa tem título clínico e **título em linguagem
simples**, prazo de referência e a evidência que a justifica. Concluir uma etapa ativa a
seguinte automaticamente.

**Adulto — 6 fases, 22 etapas:** Referenciação e primeira avaliação · Otimização protésica e
estudo de candidatura · Decisão · Cirurgia · Ativação e programação · Reabilitação e
resultados.

**Pediátrico — 7 fases, 25 etapas:** Deteção e diagnóstico (regra 1-3-6) · Intervenção
precoce e próteses · Estudo de candidatura · Decisão e cirurgia · Ativação e programação ·
Reabilitação, creche e escola · Resultados e transição. Acompanhado pela **idade auditiva**.

## 4. O que mudou com a evidência

Sete artigos da pasta `ULSSJ/PROM/cochlear implants` — resumo e referências em
[evidencia.html](evidencia.html).

| Mudança | Porquê |
|---|---|
| **CIQOL-35/10** substitui o NCIQ no núcleo | Construído com a metodologia PROMIS, validado em utilizadores de IC; o NCIQ tem limitações psicométricas documentadas |
| **CIQOL-Expectations** na candidatura | Expectativas acima do resultado típico preveem insatisfação; a plataforma compara com as normas do CIQOL-35 e alerta para aconselhamento |
| **HUI-3** como utilidade genérica (EQ-5D opcional) | O EQ-5D é pouco sensível à audição; o HUI-3 tem atributo auditivo e é o usado nas análises custo-utilidade |
| **Protocolo de upgrade** de processador | Benefício quando melhora ≥ 20 pp na fala ou ≥ 2 dB no SRT, **ou** APHAB ≥ 3,8 pp, **ou** APSQ ≥ 0,74 — os PROMs detetam benefício que os testes em cabine não mostram |
| **MuRQoL** e reabilitação musical | Fator = importância − frequência; alerta quando a música importa e foi perdida |
| **PREM** (experiência com o serviço) | Os modelos de prestação de serviço comparam-se pela experiência, não só pelo resultado |
| **Resultados sociais** (emprego, escolaridade) | Base da análise custo-benefício |
| **Consultas pedidas pelo doente** | Modelos de seguimento centrados no doente reduzem consultas de rotina sem perder resultado |
| Domínios **CIF** em cada questionário | Mostra o que cada instrumento cobre e o que falta |

## 5. Regras de alerta

Calculadas pela vista `v_alertas` sempre que é consultada; um alerta tratado sai da lista.

| Regra | Condição |
|---|---|
| Etapa parada | Etapa ativa há mais tempo do que o prazo de referência |
| Uso baixo | Menos de 6 h/dia no primeiro ano após ativação |
| Expectativas acima do típico | Domínio CIQOL-Expectations acima de média + 1 DP das normas do CIQOL-35 |
| Consulta sem intérprete | Doente de LGP com consulta nos próximos 7 dias sem apoio garantido |
| Pedido de consulta | Utilizador pediu consulta e ainda não foi marcada |
| Mensagem urgente | Mensagem marcada como urgente por ler |
| Questionário por responder | Enviado há mais de 7 dias |
| Prioridade pediátrica | Criança com menos de 18 meses à espera de cirurgia há mais de 30 dias |
| Reavaliar processador | Processador com mais de 5 anos |
| Reabilitação musical | Fator MuRQoL ≥ 1 |

## 6. Questionários

Catálogo de 26 instrumentos em `questionarios` (`02_catalogo.sql`), apresentado em
`area-profissional/instrumentos.html`: tipo (PROM, PREM, expectativas), grupo, respondente,
momentos, domínios CIF, licença, estado da versão portuguesa, MCID e normas.

- **Núcleo adulto:** CIQOL-10 · SSQ12 · HUI-3 · PREM. **Candidatura:** CIQOL-Expectations,
  CIQOL-35, APHAB. **Modulares:** APSQ, MuRQoL, THI, DHI, HADS, esforço auditivo.
- **Pediatria por idade:** LittlEARS, IT-MAIS, PEACH (0–2) · MAIS/MUSS, TEACH, CCIPP (3–5) ·
  HEAR-QL, PedsQL, VFS-Peds (6+) · preparação para a transição (13+).
- Cada resposta guarda **quem respondeu**, idade e idade auditiva — séries com proxy e
  autorreporte misturados não são comparáveis.
- Pontuação no browser (`creicApi.pontuar`): média 0–100, soma, APHAB, MuRQoL.

> Os instrumentos com direitos de autor têm **itens de demonstração**, assinalados no
> formulário. Antes de uso clínico: versão portuguesa validada e licença (PedsQL, HUI-3 e
> EQ-5D exigem; CIQOL e HEAR-QL, contactar autores).

## 7. Base de dados

Pasta `database/`, a correr por ordem no SQL Editor do Supabase:

| Ficheiro | Conteúdo |
|---|---|
| `01_schema.sql` | 22 tabelas, gatilhos da jornada e de auditoria, funções RPC, vistas `v_estado_doente` e `v_alertas`, políticas RLS |
| `02_catalogo.sql` | Etapas das duas jornadas e catálogo de questionários (idempotente) |
| `03_primeiro_profissional.sql` | Dá papel de profissional a uma conta já criada |
| `04_dados_demo.sql` | Opcional: 7 doentes fictícios `DEMO-…`, um por tipo de alerta |

Tabelas principais: `doentes` (com `grupo`), `perfis` (`papel` utilizador/profissional),
`preferencias_comunicacao`, `etapas_modelo`, `jornada_doente`, `convites`, `marcacoes`,
`mensagens`, `questionarios`, `pedidos_questionario`, `respostas_questionario`,
`avaliacoes_audiologicas`, `programacoes`, `processadores`, `exercicios`,
`registos_exercicio`, `diario`, `marcos_linguagem`, `resultados_sociais`,
`decisoes_candidatura`, `alertas_tratados`, `auditoria`.

Funções chamadas pelo site: `meu_contexto`, `criar_convite`, `ativar_conta`,
`responder_questionario`, `pedir_apoio_marcacao`, `marcar_mensagens_lidas`,
`indicadores_centro`.

## 8. Estrutura

```
CREIC/
├── index.html                  apresentação + login (Utilizador | Profissional)
├── ativar-conta.html           ativação com código
├── evidencia.html              resumo da evidência (público)
├── area-adulto/                8 páginas
├── area-pediatrica/            7 páginas
├── area-profissional/          dashboard, novo-doente, doente, alertas, reuniao,
│                               instrumentos, indicadores
├── assets/css/styles.css
├── assets/js/
│   ├── vendor/supabase.js      cliente Supabase (UMD, sem CDN)
│   ├── supabase-config.js      URL e anon key do projeto  ← preencher
│   ├── supabase-client.js      creicApi: todas as chamadas à base de dados
│   ├── app.js                  guarda de sessão, menus, onda da jornada, gráficos SVG
│   ├── ficha-doente.js         ficha clínica (separadores)
│   ├── paginas-utilizador.js   páginas das áreas de adulto e pediátrica
│   ├── proms.js                texto de apoio do catálogo
│   └── dados.js                só a ilustração da página inicial
├── assets/img/                 logótipo SoundBirth
├── database/                   SQL (secção 7)
└── GUIA-SUPABASE.md            configuração passo a passo
```

Sem `supabase-config.js` preenchido, as páginas mostram um aviso de configuração em vez de
erros.

## 9. O que ainda não é

- **Não validado clinicamente.** Prazos, limiares e protocolos têm de ser revistos pela
  equipa e alinhados com as normas da DGS.
- **Não pronto para dados reais:** falta aprovação institucional, avaliação de impacto
  (RGPD), alojamento aprovado para dados de saúde e autenticação em dois passos.
- **Sem notificações** por email/SMS: os alertas só aparecem na plataforma.
- **Sem conteúdos em LGP** reais nem integração com o software dos fabricantes (o uso diário
  é registado à mão na programação).
- O SQL foi revisto mas testado apenas contra um simulador; a primeira execução no Supabase é
  o teste real.

## 10. Decisões em aberto para a equipa

1. **Início da jornada pediátrica:** no rastreio neonatal ou só na referenciação ao CREIC?
2. **Bateria final de PROMs**, versões portuguesas e licenças.
3. **Transição aos 18 anos:** quando o jovem tem conta própria e o que os pais continuam a ver.
4. **Quem responde às mensagens** e em que prazo — incluindo as marcadas como urgentes.
5. **Datalogging:** registo manual ou integração com o fabricante.
6. **Escola:** o que vê a educadora ou o professor, e quem autoriza.
7. **Intérpretes e conteúdos em LGP:** produção, parcerias ou contrato.

---

*v0.2 · setembro de 2026 · dados de demonstração fictícios, sem valor clínico.*
