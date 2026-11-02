# StayFinder

En AirBnB-liknande bokningstjänst där man kan hitta, skapa och boka boenden.
Betygsgrundande uppgift i Webbutvecklare Fullstack Open Source, Nackademin.

| Del | Teknik |
|---|---|
| Backend | TypeScript, Hono på Node.js, Zod |
| Databas | Supabase (PostgreSQL) med Row Level Security |
| Inloggning | Supabase Auth, sessionen i httpOnly-cookies via `@supabase/ssr` |
| Frontend | Next.js 16 (App Router), React, TypeScript, Tailwind CSS |

## Struktur

```
stayfinder/
├── backend/
│   ├── src/
│   │   ├── index.ts          app, CORS, routes, 404 och felhantering
│   │   ├── env.ts            miljövariabler validerade med Zod
│   │   ├── lib/supabase.ts   Supabase-klient per anrop med cookies
│   │   ├── middleware/       requireAuth, validate, requirePropertyOwner/requireBookingOwner
│   │   ├── routes/           auth, properties, bookings
│   │   ├── validators/       Zod-scheman
│   │   └── types/            typer härledda från scheman (z.infer)
│   ├── supabase/migrations/  001_properties, 002_ownership, 003_bookings
│   └── requests.http         testanrop (REST Client)
└── frontend/
    ├── app/                  sidor: /, /properties/[id], /properties/new, /login, /register, /bookings
    ├── components/           Nav, AuthForm, PropertyCard, BookingForm, BookingList, BookingItem, FieldError
    └── lib/                  api.ts (fetch), auth.tsx (inloggning), types.ts, booking.ts, images.ts
```

## Kom igång

**1. Databas (Supabase)**
- Skapa ett projekt på supabase.com.
- Kör migrationerna i SQL Editor i ordning: `001_properties.sql`, `002_ownership.sql`, `003_bookings.sql`.
- Stäng av e-postbekräftelse: Authentication → Sign In / Providers → Email → *Confirm email* av.

**2. Backend** (port 3000)
```bash
cd backend
cp .env.example .env      # fyll i SUPABASE_URL och SUPABASE_PUBLISHABLE_KEY
npm install
npm run dev
```

**3. Frontend** (port 3001)
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```
Öppna http://localhost:3001.

**4. Testanrop**
Öppna `backend/requests.http` i VS Code med tillägget REST Client. Skapa två användare (A = värd, B = gäst) och fyll i `TEST_A_*` och `TEST_B_*` i `backend/.env` – lösenorden ligger aldrig i Git. Kör sektionerna uppifrån och ned.

## API

| Metod | Route | Inloggning | Svar |
|---|---|---|---|
| GET | `/health` | – | 200 |
| POST | `/auth/register` | – | 201 / 400 |
| POST | `/auth/login` | – | 200 / 400 / 401 |
| POST | `/auth/logout` | – | 200 |
| GET | `/auth/me` | ja | 200 / 401 |
| GET | `/properties?location=&max_price=&guests=&sort=price_asc\|price_desc` | – | 200 / 400 |
| GET | `/properties/:id` | – | 200 / 400 / 404 |
| POST | `/properties` | ja | 201 / 400 / 401 |
| PATCH | `/properties/:id` | ägaren | 200 / 400 / 401 / 403 / 404 |
| DELETE | `/properties/:id` | ägaren | 200 / 400 / 401 / 403 / 404 |
| GET | `/bookings` | ja | 200 / 401 – mina bokningar |
| GET | `/properties/:id/bookings` | ja | 200 / 401 – gäst: sina egna, ägare: alla |
| POST | `/properties/:id/bookings` | ja | 201 / 400 / 401 / 404 / 409 |
| PATCH | `/bookings/:id` | gästen | 200 / 400 / 401 / 403 / 404 / 409 |
| DELETE | `/bookings/:id` | gästen | 200 / 400 / 401 / 403 / 404 |

## Uppfyllda kriterier

**Alla G-kriterier (G1–G16) och VG1, VG2, VG3, VG6.**

### G

| # | Kriterium | Var i koden |
|---|---|---|
| G1 | Skapa konto, logga in, logga ut | `backend/src/routes/auth.ts`, `frontend/components/AuthForm.tsx`, `Nav.tsx` |
| G2 | Inloggningen finns kvar vid omladdning, visar vem som är inloggad | httpOnly-cookie + `GET /auth/me`, `frontend/lib/auth.tsx`, e-post i menyn |
| G3 | Olika meny för inloggad och utloggad | `frontend/components/Nav.tsx` |
| G4 | Lista och detaljsida | `GET /properties`, `GET /properties/:id`, `frontend/app/page.tsx`, `app/properties/[id]/` |
| G5 | Filter på plats, maxpris, gäster | `propertyQuerySchema` + `routes/properties.ts` (`ilike`, `lte`, `gte`), formuläret i `app/page.tsx` |
| G6 | Bara inloggade kan skapa/ändra/ta bort boenden – API och databas | `requireAuth` i `routes/properties.ts`, RLS-policyer och `revoke` för `anon` i `002_ownership.sql` |
| G7 | Skapa boende via formulär | `frontend/app/properties/new/page.tsx` |
| G8 | Sortering på pris i backend | `.order("price_per_night")` i `routes/properties.ts` |
| G9 | Boka från detaljsidan, utloggad uppmanas logga in | `POST /properties/:id/bookings`, `frontend/components/BookingForm.tsx` |
| G10 | Ogiltig bokning nekas, felet visas vid fältet | `validators/booking.ts` (400 med `fields`), `FieldError.tsx` |
| G11 | Antal nätter och totalpris innan bokning | `countNights` i `frontend/lib/booking.ts`, `BookingForm.tsx` |
| G12 | Se, ändra och ta bort bokningar | `routes/bookings.ts`, `BookingList.tsx`, `BookingItem.tsx`, `app/bookings/page.tsx` |
| G13 | Laddningsvy, felvy och egen sida när ett boende saknas | alla sidor; "Boendet finns inte" i `PropertyDetails.tsx` (404 och 400) |
| G14 | Rätt statuskoder 200/201/400/401/404 | `validate`-middleware (400), `requireAuth` (401), `app.notFound` / `maybeSingle` (404), se `requests.http` |
| G15 | Databasen skyddar själv sina tabeller | RLS på `properties` och `bookings`, `revoke` från `anon` |
| G16 | All data typad | backend: `z.infer`-typer och `AppEnv`; frontend: `lib/types.ts`, `api<T>()` |

### VG

| # | Regel | API | Databas | Varför där | Testat i `requests.http` |
|---|---|---|---|---|---|
| VG1 | Ägarskap | `requirePropertyOwner` / `requireBookingOwner` → 403/404 | `owner_id` / `user_id` default `auth.uid()`, RLS: ändra bara egna rader, gäst ser sina bokningar, ägaren ser alla på sitt boende | API:t ger tydliga fel, databasen garanterar regeln även vid direkta anrop | Fas 6: 1–8. Fas 8: 9, 11, 12 |
| VG2 | Inga dubbelbokningar | `bookingError`: `23P01` → 409 "Boendet är redan bokat dessa datum" | exclusion constraint `no_overlapping_bookings` med `daterange '[)'`, gäller inte avbokade | Bara databasen ser **alla** bokningar (RLS döljer andras för API:t) och constrainten är säker även vid samtidiga anrop | Fas 8: 5 (angränsande OK), 6 (krock), 16 (krock vid ändring), 17 (krockar inte med sig själv) |
| VG3 | Kapacitet | hämtar `max_guests` från databasen → 400 vid fältet `guests` | trigger `booking_rules` vid insert och update | API:t ger ett tydligt fältfel, triggern stoppar även ändringar och direkta anrop | Fas 8: 7 (API), 18 (trigger) |
| VG6 | Pris på servern | Zod tar bort `total_price`, `price_per_night` och `status` från klienten | triggern hämtar boendets pris, räknar `nätter × pris`, sparar och låser `price_per_night` | Klienten kan aldrig styra priset; priset sparas på bokningen så att senare prisändringar inte påverkar den | Fas 8: 4 (fuskpris ignoreras), 13 + 15 (prisändring påverkar inte), 17 (gamla nattpriset används) |

Övrigt som testas: avbokad bokning kan inte ändras (fas 8: 19–20), utloggad → 401 (23–24).

## Säkerhet

- **Autentisering:** sessionen ligger i httpOnly-cookies – JavaScript kan inte läsa dem (skydd mot XSS). Frontenden skickar dem med `credentials: "include"`.
- **CORS:** bara frontendens adress tillåts, med `credentials: true` (origin kan då inte vara `*`).
- **Behörighet i två lager:** middleware i API:t och RLS i databasen.
- **Validering:** Zod i alla routes; okända fält tas bort (skydd mot mass assignment).
- **SQL injection:** Supabase-klienten skickar parametriserade frågor, ingen SQL byggs med strängar.
- **Inloggningsfel:** samma meddelande för fel e-post och fel lösenord (skydd mot user enumeration).
- **Hemligheter:** bara den publika `publishable key` används; `.env` ligger aldrig i Git.
