-- Fas 4: Tabellen för boenden.

-- check-reglerna speglar Zod-valideringen i API:t (försvar i flera lager):
-- om någon går förbi API:t och anropar databasen direkt stoppas felaktig data här ändå. (G15)
create table public.properties (
  -- Databasen skapar id och created_at själv, klienten kan inte välja dem.
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) >= 2),
  description text not null,
  location text not null,
  -- numeric(10, 2) = decimaltal med 2 decimaler, passar för pengar
  price_per_night numeric(10, 2) not null check (price_per_night > 0),
  max_guests integer not null check (max_guests >= 1),
  created_at timestamptz not null default now()
);

-- grant = vilka roller som får röra tabellen alls. RLS nedan = vilka RADER.
-- anon = utloggad, authenticated = inloggad.
grant select, insert, update, delete on public.properties to anon, authenticated;

-- G15: Slå på Row Level Security – databasen skyddar själv tabellen.
alter table public.properties enable row level security;

-- TEMPORÄRT: alla får göra allt, eftersom inloggning inte fanns ännu.
-- Ersätts med riktiga regler i 002_ownership.sql (fas 6).
create policy "temp_select" on public.properties for select using (true);
create policy "temp_insert" on public.properties for insert with check (true);
create policy "temp_update" on public.properties for update using (true) with check (true);
create policy "temp_delete" on public.properties for delete using (true);

-- Testdata så att listan inte är tom från början.
insert into public.properties (title, description, location, price_per_night, max_guests) values
  ('Stuga vid sjön', 'Mysig stuga med egen brygga vid sjön.', 'Dalarna, Sverige', 900, 4),
  ('Lägenhet i city', 'Nära tunnelbanan', 'Stockholm, Sverige', 1400, 2);
