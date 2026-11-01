-- Fas 6: Ägarskap och RLS för boenden.
-- Ersätter de temporära policyerna från 001 med riktiga regler.

-- VG1: Varje boende tillhör den som skapade det.
-- default auth.uid() = databasen sätter ägaren från inloggningens token,
-- så klienten kan aldrig välja ägare själv.
alter table public.properties
  add column owner_id uuid references auth.users(id) on delete cascade default auth.uid();

-- Ta bort "alla får göra allt" från fas 4.
drop policy "temp_select" on public.properties;
drop policy "temp_insert" on public.properties;
drop policy "temp_update" on public.properties;
drop policy "temp_delete" on public.properties;

-- G6: Utloggade (anon) får inte skriva alls, inte ens försöka.
revoke insert, update, delete on public.properties from anon;

-- G4: Alla, även utloggade, får se boenden.
create policy "properties_select_all" on public.properties
  for select using (true);

-- G6 + VG1: Bara inloggade får skapa, och bara i sitt eget namn.
create policy "properties_insert_own" on public.properties
  for insert to authenticated
  with check (owner_id = auth.uid());

-- G6 + VG1: Bara ägaren får ändra.
-- using = vilka rader man får träffa, with check = att raden fortfarande är ens egen efteråt.
create policy "properties_update_own" on public.properties
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- G6 + VG1: Bara ägaren får ta bort.
create policy "properties_delete_own" on public.properties
  for delete to authenticated
  using (owner_id = auth.uid());
