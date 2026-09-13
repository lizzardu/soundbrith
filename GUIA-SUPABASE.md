# SoundBirth — Guia: ligar a plataforma ao Supabase

Da página publicada sem dados à plataforma com login e base de dados real. Cerca de 30 minutos.

> **Protótipo.** Mesmo ligado a uma base de dados real, isto não está pronto para dados de
> doentes reais — ver [Antes de usar com doentes reais](#antes-de-usar-com-doentes-reais).

---

## 1. Projeto Supabase

Se ainda não tem projeto para o SoundBirth:

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Nome à escolha (ex. `soundbirth-creic`), uma password para a base de dados (guarde-a)
3. **Região na União Europeia** (ex. Frankfurt)

## 2. Criar as tabelas

No projeto: **SQL Editor → New query**. Para cada ficheiro da pasta `database/`, por esta
ordem, cole o conteúdo inteiro e carregue em **Run**:

| Ficheiro | O que faz |
|---|---|
| `01_schema.sql` | Tabelas, funções, gatilhos, vistas e regras de acesso (RLS) |
| `02_catalogo.sql` | As etapas das duas jornadas e o catálogo de 26 questionários. Pode voltar a correr-se para atualizar |
| `04_dados_demo.sql` | **Opcional.** Sete doentes fictícios (`DEMO-…`), cada um a mostrar uma regra de alerta |

O `03_primeiro_profissional.sql` corre-se no passo 4, depois de existir a conta.

Deve ver "Success" em cada um. Em **Table Editor** passam a existir `doentes`, `perfis`,
`jornada_doente`, `questionarios`, etc.

## 3. Configurar a autenticação

Em **Authentication → Sign In / Providers → Email**:

- **Enable Email provider**: ligado
- **Confirm email**: **desligado**
- **Allow new users to sign up** (em Authentication → Settings): **ligado**

Porquê assim: o utilizador ativa a própria conta com o código que a equipa lhe dá, e a
ativação cria a conta nesse momento. Com a confirmação por email ligada, a conta só ficaria
utilizável depois de um email que o Supabase gratuito envia com limites apertados — e que
não é acessível a quem não pode receber email.

**E o registo livre não é um risco?** Qualquer pessoa consegue criar uma conta vazia, mas sem
perfil não vê nada: todas as tabelas estão protegidas por RLS, e o perfil de utilizador só é
criado pela função `ativar_conta()`, com um código válido emitido por um profissional para
aquele email. O perfil de profissional só se cria no SQL Editor.

Em **Authentication → URL Configuration**, ponha como **Site URL** o endereço publicado
(ex. `https://lizzardu.github.io/soundbrith/`).

## 4. Primeira conta de profissional

1. **Authentication → Users → Add user → Create new user**: email e password, com
   **Auto Confirm User** ligado
2. No **SQL Editor**, abra `database/03_primeiro_profissional.sql`, substitua o email, o
   nome e a especialidade, e corra

Repita para cada profissional. A última consulta do ficheiro lista quem tem acesso.

## 5. Ligar o site ao projeto

1. **Project Settings → API**: copie o **Project URL** e a **anon public key**
   (nunca a `service_role`)
2. Abra `assets/js/supabase-config.js` e substitua os dois valores

```js
window.CREIC_CONFIG = {
  SUPABASE_URL: "https://xxxxxxxx.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOi..."
};
```

A anon key pode ir para o GitHub: é pública por natureza. Quem protege os dados são as regras
de acesso da base de dados.

## 6. Experimentar o circuito completo

1. Abra o site → **Entrar** → separador **Profissional** → entre com a conta do passo 4
2. **Novo doente**: escolha o grupo (adulto ou pediátrico), preencha, e em "Acesso do
   utilizador" ponha um email seu de teste → **Registar doente**
3. Copie o **código de 8 caracteres** mostrado
4. Numa janela privada: página inicial → **Recebi um código de acesso** → mesmo email,
   uma password, o código → **Ativar e entrar**
5. Vê a área de adulto ou a pediátrica, conforme o grupo escolhido no passo 2
6. De volta à área clínica, na ficha do doente: envie um questionário, crie uma marcação,
   escreva uma mensagem — e veja-os aparecer na área do utilizador

Com os dados de demonstração carregados, abra **Alertas**: devem aparecer cerca de dez, um
por regra.

## 7. Publicar

Com `supabase-config.js` preenchido, envie as alterações para o GitHub:

```bash
git add -A
git commit -m "Ligar ao Supabase"
git push
```

O GitHub Pages atualiza em 1–2 minutos.

---

## Como funciona o acesso

| | Profissional | Utilizador |
|---|---|---|
| Quem cria a conta | Administração, no SQL Editor | O próprio, com o código da equipa |
| O que vê | Todos os doentes | Só o seu doente |
| Onde entra | `area-profissional/` | `area-adulto/` ou `area-pediatrica/`, conforme o grupo |
| Pode | Tudo | Ler; responder a questionários; pedir consultas e apoio; mensagens; registar treino e diário; mudar as suas preferências de contacto |

- O **grupo** é escolhido pelo profissional ao criar o doente e pode ser mudado na ficha
  ("Dados e grupo"). Na passagem de pediátrico a adulto, as etapas antigas ficam no
  histórico e o utilizador passa a ver a outra área na entrada seguinte.
- Uma criança pode ter **várias contas** (mãe, pai, tutor), cada uma com o seu código.
- Cada página verifica a sessão ao abrir e **redireciona** quem não pertence ali. Mas a
  proteção real está nas regras RLS: mesmo contornando a página, a API não devolve dados de
  outro doente.
- O código de acesso é guardado **só cifrado** (bcrypt), expira em 7 dias e fica ligado ao email.

## Alertas

A vista `v_alertas` calcula dez regras sempre que é consultada — etapa parada, uso baixo do
processador, expectativas acima do típico, consulta sem intérprete, pedido de consulta,
mensagem urgente, questionário por responder, prioridade pediátrica, processador com mais de
5 anos e indicação para reabilitação musical. Os limiares estão no fim de
`01_schema.sql`, secção 17.2, e são propostas para a equipa rever.

**Não há envio de notificações** (email ou SMS): os alertas aparecem quando alguém da equipa
abre a plataforma. Para avisos por email, o caminho é o mesmo do Fénix — uma Edge Function
chamada por um gatilho da base de dados.

## Questionários

Os instrumentos publicados (CIQOL, SSQ12, APHAB, APSQ, MuRQoL, LittlEARS, PEACH…) têm, na
coluna `questionarios.definicao`, **itens de demonstração** — marcados e avisados no
formulário. Antes de uso clínico, substitua pelo texto e pela regra de pontuação da versão
portuguesa licenciada. Os instrumentos sem formulário online (HUI-3, PedsQL, TEACH…) são
enviados na mesma e a pontuação regista-se na ficha ("Registar pontuação").

A pontuação é calculada no browser (`creicApi.pontuar` em `supabase-client.js`) e guardada
com a resposta, junto com quem respondeu, a idade e a idade auditiva.

## Problemas frequentes

| Sintoma | Causa provável |
|---|---|
| "Plataforma por configurar" em todas as páginas | `supabase-config.js` ainda tem os valores de exemplo |
| Entra, mas volta sempre para "Ativar conta" | A conta existe mas não tem perfil: falta o código (utilizador) ou o `03_…` (profissional) |
| "Este email já tem conta com outra palavra-passe, ou o projeto exige confirmação por email" | "Confirm email" está ligado (passo 3), ou a pessoa já ativou com outra password |
| "Código inválido, já usado ou expirado para este email" | Email diferente do registado no convite, código já usado, ou mais de 7 dias — gere outro na ficha |
| "Sem permissão para esta operação" | Regra RLS a bloquear: confirme que a conta tem o papel certo em `perfis` |
| Erro ao correr `04_dados_demo.sql` | Os `DEMO-…` já existem: apague-os com `delete from doentes where processo like 'DEMO-%';` e corra de novo |

## Antes de usar com doentes reais

- Aprovação institucional da ULS, avaliação de impacto (RGPD) e acordo de tratamento de dados
- Alojamento aprovado para dados de saúde (o plano gratuito do Supabase não serve)
- Autenticação em dois passos para profissionais
- Itens e pontuação licenciados dos questionários
- Revisão dos limiares de alerta e dos prazos das etapas pela equipa clínica
- Envio de notificações e política de resposta às mensagens urgentes
