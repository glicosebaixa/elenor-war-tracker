-- ELENOR WAR TRACKER / SUPABASE
-- 1) Crie um projeto no Supabase.
-- 2) No Authentication > Users, crie seu usuário administrador.
-- 3) Copie o UUID desse usuário e substitua ADMIN_USER_UUID abaixo.
-- 4) Rode este SQL inteiro no SQL Editor.

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  level integer not null default 0,
  "group" text not null check ("group" in ('soul','hunted')),
  status text not null default 'offline' check (status in ('online','pz','offline')),
  last_seen timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.players enable row level security;
alter table public.admins enable row level security;

grant select on public.players to anon;
grant select, insert, update, delete on public.players to authenticated;
grant select on public.admins to authenticated;

-- VISUALIZAÇÃO: qualquer visitante pode APENAS ler players.
create policy "public can read players"
on public.players for select to anon, authenticated
using (true);

-- ADMIN: somente o usuário cadastrado na tabela admins pode alterar.
create policy "admins can insert players"
on public.players for insert to authenticated
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create policy "admins can update players"
on public.players for update to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create policy "admins can delete players"
on public.players for delete to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create policy "admins can read admin list"
on public.admins for select to authenticated
using (user_id = auth.uid());

-- Depois de criar seu usuário no Authentication, rode:
-- insert into public.admins (user_id) values ('ADMIN_USER_UUID');
