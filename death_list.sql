-- Death List: mortes dos jogadores do grupo RANDOMS/HUNTEDS
create table if not exists public.player_deaths (
  id uuid primary key default gen_random_uuid(),
  player_id uuid null references public.players(id) on delete cascade,
  player_name text not null,
  level integer,
  died_at timestamptz not null,
  reason text,
  source_url text,
  source_key text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists player_deaths_died_at_idx on public.player_deaths(died_at desc);
create index if not exists player_deaths_player_id_idx on public.player_deaths(player_id);

alter table public.player_deaths enable row level security;
drop policy if exists player_deaths_public_read on public.player_deaths;
create policy player_deaths_public_read on public.player_deaths for select using (true);

grant select on public.player_deaths to anon, authenticated;
