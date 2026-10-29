create table public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) >= 2),
  description text not null,
  location text not null,
  price_per_night numeric(10, 2) not null check (price_per_night > 0),
  max_guests integer not null check (max_guests >= 1),
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.properties to anon, authenticated;

alter table public.properties enable row level security;

--midlertidig fordi vi ikke har innloggning enda, men vi vil ha det senere
create policy "temp_select" on public.properties for select using (true);
create policy "temp_insert" on public.properties for insert with check (true);
create policy "temp_update" on public.properties for update using (true) with check (true);
create policy "temp_delete" on public.properties for delete using (true);

insert into public.properties (title, description, location, price_per_night, max_guests) values
  ('Stuga vid sjön', 'Mysig stuga med egen brygga vid sjön.', 'Dalarna, Sverige', 900, 4),
  ('Lägenhet i city', 'Nära tunnelbanan', 'Stockholm, Sverige', 1400, 2);
