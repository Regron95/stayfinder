-- 003_bookings.sql – Fas 8: bokningar (G9, G10, G12, G15, VG1, VG2, VG3, VG6)
-- Körs i Supabase: SQL Editor → New query → klistra in → Run

-- ============ TABELL ============
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  -- Tas boendet bort försvinner dess bokningar
  property_id uuid not null references public.properties(id) on delete cascade,
  -- VG1: vem som bokade. Databasen sätter den inloggade, aldrig klienten.
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  -- G10: samma regler som i Zod, så de gäller även om någon går förbi API:t
  guest_name text not null check (char_length(trim(guest_name)) >= 2),
  guest_email text not null check (guest_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  guests int not null check (guests >= 1),
  check_in date not null,
  check_out date not null,
  -- VG6: sätts av triggern nedan, aldrig av klienten
  price_per_night numeric(10,2) not null,
  total_price numeric(10,2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  -- G10: utcheckning måste vara efter incheckning
  constraint check_out_after_check_in check (check_out > check_in)
);

-- ============ RLS (G15, VG1) ============
alter table public.bookings enable row level security;
-- Utloggade får ingenting, inloggade får kommandona – RLS begränsar vilka rader
revoke all on public.bookings from anon;
grant select, insert, update, delete on public.bookings to authenticated;

-- Gästen ser sina egna bokningar, ägaren av boendet ser alla bokningar på det
create policy bookings_select_guest_or_host on public.bookings
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.properties p
      where p.id = bookings.property_id and p.owner_id = auth.uid()
    )
  );

-- Man får bara boka i sitt eget namn
create policy bookings_insert_own on public.bookings
  for insert to authenticated
  with check (user_id = auth.uid());

-- Bara gästen själv får ändra/ta bort, och kan inte ge bort bokningen
create policy bookings_update_own on public.bookings
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy bookings_delete_own on public.bookings
  for delete to authenticated
  using (user_id = auth.uid());

-- ============ VG2: inga dubbelbokningar ============
-- btree_gist behövs för att kombinera "=" (samma boende) med "&&" (datum överlappar)
create extension if not exists btree_gist with schema extensions;

-- Två bokningar på samma boende får inte ha överlappande datum.
-- '[)' = check_in räknas, check_out räknas inte → man kan checka in samma dag som någon checkar ut.
-- Avbokade räknas inte. En bokning som ändras jämförs bara mot ANDRA rader.
alter table public.bookings
  add constraint no_overlapping_bookings
  exclude using gist (
    property_id with =,
    daterange(check_in, check_out, '[)') with &&
  )
  where (status <> 'cancelled');

-- ============ VG3 + VG6: trigger ============
-- Körs FÖRE varje insert/update, innan raden sparas.
-- Använder boendets värden från databasen – aldrig det klienten skickat.
create or replace function public.booking_rules()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  prop record;
begin
  if tg_op = 'UPDATE' then
    if old.status = 'cancelled' then
      raise exception 'En avbokad bokning kan inte ändras';
    end if;
    -- Gästen får bara avboka, inte t.ex. bekräfta sin egen bokning
    if new.status <> old.status and new.status <> 'cancelled' then
      raise exception 'Status kan bara ändras till cancelled';
    end if;
    -- Låsta fält: kan inte flyttas till annat boende, priset från bokningstillfället ligger kvar (VG6)
    new.property_id := old.property_id;
    new.price_per_night := old.price_per_night;
  end if;

  select p.price_per_night, p.max_guests into prop
  from public.properties p
  where p.id = new.property_id;

  if tg_op = 'INSERT' then
    -- VG6: priset hämtas från boendet. En ny bokning är alltid väntande.
    new.price_per_night := prop.price_per_night;
    new.status := 'pending';
  end if;

  -- VG3: max_guests från databasen
  if new.guests > prop.max_guests then
    raise exception 'För många gäster: max % för detta boende', prop.max_guests;
  end if;

  -- VG6: date - date ger antal nätter
  new.total_price := (new.check_out - new.check_in) * new.price_per_night;
  return new;
end;
$$;

create trigger booking_rules
  before insert or update on public.bookings
  for each row
  execute function public.booking_rules();
