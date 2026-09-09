-- CORREÇÃO DE SEGURANÇA DO ELENOR WAR TRACKER
-- Execute uma única vez no SQL Editor do Supabase.
-- Visitantes anônimos poderão consultar SOMENTE jogadores online/PZ.
-- O administrador autenticado continua podendo consultar todos.

drop policy if exists "public can read players" on public.players;

drop policy if exists "public can read online players" on public.players;
drop policy if exists "admins can read all players" on public.players;

create policy "public can read online players"
on public.players for select to anon
using (status <> 'offline');

create policy "admins can read all players"
on public.players for select to authenticated
using (
  exists (
    select 1 from public.admins a
    where a.user_id = auth.uid()
  )
);
