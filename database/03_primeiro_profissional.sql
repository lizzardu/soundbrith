-- ============================================================================
-- SOUNDBIRTH — Dar acesso de PROFISSIONAL a uma conta
--
-- As contas de profissional não se criam na plataforma: um utilizador comum
-- nunca consegue atribuir-se esse papel. Criam-se aqui, no SQL Editor, que só
-- quem administra o projeto Supabase consegue abrir.
--
-- Passos:
--   1. Supabase → Authentication → Users → Add user → Create new user
--      email + palavra-passe, e ative "Auto Confirm User"
--   2. Substitua os três valores abaixo e corra este ficheiro.
--   3. Repita para cada profissional da equipa.
-- ============================================================================

select promover_profissional(
  'nome.apelido@ulssjose.min-saude.pt',   -- o email com que criou a conta no passo 1
  'Dra. Nome Apelido',                    -- como aparece na plataforma e nas mensagens
  'Audiologia'                            -- ORL, Audiologia, Terapia da fala, Psicologia, Gestão de caso...
);


-- ---------------------------------------------------------------------------
-- Verificar quem tem acesso de profissional
-- ---------------------------------------------------------------------------
select u.email, p.nome, p.especialidade, p.criado_em
from perfis p join auth.users u on u.id = p.id
where p.papel = 'profissional'
order by p.nome;


-- ---------------------------------------------------------------------------
-- Outras operações úteis (descomente para usar)
-- ---------------------------------------------------------------------------

-- Ver as contas de utilizador ligadas a cada doente:
-- select d.processo, d.nome as doente, d.grupo, p.nome as titular, p.relacao, u.email
-- from perfis p join doentes d on d.id = p.doente_id join auth.users u on u.id = p.id
-- order by d.nome;

-- Retirar o acesso de profissional a alguém (a conta continua a existir, sem acesso a dados):
-- delete from perfis where id = (select id from auth.users where email = 'email@exemplo.pt');
