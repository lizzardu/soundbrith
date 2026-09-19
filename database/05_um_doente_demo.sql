-- ============================================================================
-- SOUNDBIRTH — deixar só um doente de demonstração e dar-lhe acesso
-- ============================================================================
-- Mantém o doente DEMO-0142 (Manuel Torres Ribeiro, adulto, implantado há
-- 5 semanas), apaga todos os outros doentes — e, com eles, as suas jornadas,
-- marcações, mensagens, questionários e contas de utilizador — e cria um
-- código de acesso para o Manuel.
--
-- ANTES DE CORRER:
--   1. O 04_dados_demo.sql tem de ter sido corrido (é ele que cria o DEMO-0142).
--   2. Troque 'EMAIL-DO-DOENTE@exemplo.pt' (parte 2) pelo email com que quer
--      entrar como doente. Tem de ser DIFERENTE do email de profissional:
--      cada conta tem um só papel.
--
-- DEPOIS:
--   Página inicial → "Recebi um código de acesso" → esse email, uma
--   palavra-passe à escolha e o código que aparece no resultado desta
--   consulta. O código vale 7 dias e só é mostrado agora.
-- ============================================================================

-- 1. Apagar todos os doentes exceto o DEMO-0142 --------------------------------
do $$
begin
  if not exists (select 1 from doentes where processo = 'DEMO-0142') then
    raise exception 'O doente DEMO-0142 não existe. Corra primeiro 04_dados_demo.sql e depois este ficheiro.';
  end if;
  delete from doentes where processo <> 'DEMO-0142';
end $$;

-- 2. Código de acesso para o doente --------------------------------------------
with dados as (
  select lower(trim('EMAIL-DO-DOENTE@exemplo.pt')) as email
),
codigo as (
  -- 8 caracteres sem letras ambíguas, como em criar_convite()
  select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', (get_byte(b, i) % 31) + 1, 1), '') as c
  from (select extensions.gen_random_bytes(8) as b) x, generate_series(0, 7) as i
),
anular as (
  -- códigos anteriores ainda por usar deixam de valer
  update convites set expira_em = now()
  where usado_em is null
    and doente_id = (select id from doentes where processo = 'DEMO-0142')
    and (select email from dados) <> 'email-do-doente@exemplo.pt'
  returning id
),
novo as (
  insert into convites (doente_id, email, nome_titular, relacao, codigo_hash, expira_em)
  select d.id, dados.email, d.nome, 'proprio',
         extensions.crypt(codigo.c, extensions.gen_salt('bf')), now() + interval '7 days'
  from doentes d, dados, codigo
  where d.processo = 'DEMO-0142'
    and position('@' in dados.email) > 0
    and dados.email <> 'email-do-doente@exemplo.pt'
  returning email, expira_em
)
select novo.email as "entrar com o email",
       codigo.c   as "código de acesso",
       to_char(novo.expira_em, 'DD/MM/YYYY HH24:MI') as "válido até"
from novo, codigo;
-- Sem nenhuma linha no resultado? Falta trocar o email na parte 2.

-- 3. Verificação ------------------------------------------------------------------
-- select processo, nome, grupo from doentes;
-- select nome, papel, doente_id from perfis;
