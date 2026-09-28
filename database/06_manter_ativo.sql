-- ============================================================================
-- SOUNDBIRTH — manter o projeto Supabase ativo
-- ============================================================================
-- Um projeto Supabase gratuito é suspenso ao fim de 7 dias sem atividade.
-- Esta função escreve uma linha na tabela `atividade`; é chamada duas vezes
-- por semana pelo agendamento do GitHub (.github/workflows/manter-ativo.yml).
--
-- Correr uma vez, depois do 01_schema.sql.
-- ============================================================================

create table if not exists atividade (
  id     bigint generated always as identity primary key,
  origem text not null default 'ping',
  quando timestamptz not null default now()
);

comment on table atividade is
  'Batimento para o projeto não ser suspenso por inatividade. Sem dados de doentes.';

-- Sem políticas RLS: ninguém lê nem escreve esta tabela diretamente,
-- só através da função ping() abaixo.
alter table atividade enable row level security;

create or replace function ping(p_origem text default 'ping')
returns timestamptz
language plpgsql security definer set search_path = public as $$
declare
  v_quando timestamptz;
begin
  insert into atividade (origem)
  values (left(coalesce(nullif(trim(p_origem), ''), 'ping'), 40))
  returning quando into v_quando;

  -- guarda apenas os últimos 50 batimentos
  delete from atividade where id <= (select max(id) - 50 from atividade);

  return v_quando;
end $$;

comment on function ping(text) is
  'Regista atividade para o projeto não ser suspenso. Não devolve nem toca em dados de doentes.';

revoke all on function ping(text) from public;
grant execute on function ping(text) to anon, authenticated;

-- Verificação: deve devolver a data e a hora de agora
select ping('sql-editor') as "último batimento";
