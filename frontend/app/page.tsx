"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "@/lib/api";
import type { Property } from "@/lib/types";
import PropertyCard from "@/components/PropertyCard";

// G4: Startsidan visar alla boenden från API:t.
// "use client" = körs i webbläsaren, så fetch skickar med användarens cookie.
export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  // G13: sidan har tre lägen – laddar, fel eller data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // G5 + G8: formulärets fält. Strängar, eftersom <input> alltid ger text –
  // backenden gör om dem till tal med z.coerce.
  const [location, setLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [guests, setGuests] = useState("");
  const [sort, setSort] = useState("");

  // Query-strängen som faktiskt skickas till API:t, t.ex. "?location=Oslo&sort=price_asc".
  // Tom sträng = inga filter → alla boenden.
  const [query, setQuery] = useState("");

  // Hämtar boenden när sidan visas OCH varje gång query ändras ([query] = beroende)
  useEffect(() => {
    api<Property[]>(`/properties${query}`)
      .then(setProperties)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [query]);

  // Körs när användaren trycker "Sök"
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    // Stoppar webbläsarens vanliga beteende (ladda om hela sidan)
    e.preventDefault();

    // URLSearchParams bygger "?a=1&b=2" och kodar specialtecken (mellanslag, åäö, &).
    // Tomma fält skickas inte – annars skulle t.ex. "?guests=" ge 400 från Zod.
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (maxPrice) params.set("max_price", maxPrice);
    if (guests) params.set("guests", guests);
    if (sort) params.set("sort", sort);

    const next = params.toString() ? `?${params.toString()}` : "";
    // Samma sökning igen: useEffect körs inte, och "Laddar" skulle fastna
    if (next === query) return;

    setError(null);
    setLoading(true);
    // Ny query → useEffect körs igen → ny hämtning från backenden
    setQuery(next);
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      {/* Hero: rubrik och sökformulär på en färgad bakgrund */}
      <section className="mb-8 rounded-3xl bg-linear-to-br from-rose-500 to-orange-400 p-8 text-white">
        <h1 className="text-4xl font-bold">Hitta ditt nästa boende</h1>
        <p className="mt-2 text-rose-50">Sök bland stugor, lägenheter och hus – och boka direkt.</p>

        {/* G5 + G8: filter och sortering. Själva filtreringen och sorteringen görs i backenden.
            type="number" och min="1" är bara för användarvänlighet – den riktiga valideringen
            är propertyQuerySchema i API:t, eftersom vem som helst kan anropa API:t direkt. */}
        <form onSubmit={handleSubmit}
          className="mt-6 grid gap-3 rounded-2xl bg-white p-3 text-gray-900 sm:grid-cols-5">
          {/* Kontrollerade fält: value kommer från state, onChange uppdaterar state */}
          <input aria-label="Plats" placeholder="Plats" value={location}
            onChange={(e) => setLocation(e.target.value)} className="input" />
          <input aria-label="Maxpris" placeholder="Maxpris" type="number" min="1" value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)} className="input" />
          <input aria-label="Antal gäster" placeholder="Gäster" type="number" min="1" value={guests}
            onChange={(e) => setGuests(e.target.value)} className="input" />
          {/* value måste matcha backendens z.enum(["price_asc", "price_desc"]) */}
          <select aria-label="Sortering" value={sort}
            onChange={(e) => setSort(e.target.value)} className="input">
            <option value="">Ingen sortering</option>
            <option value="price_asc">Pris: lägst först</option>
            <option value="price_desc">Pris: högst först</option>
          </select>
          <button type="submit" className="btn">Sök</button>
        </form>
      </section>

      {/* Formuläret visas alltid – bara listan växlar mellan laddar, fel och data.
          {villkor && <x/>} = visa <x/> bara om villkoret är sant */}
      {loading && <p>Laddar boenden...</p>}
      {/* G13: felvy, t.ex. om backenden är nere eller ett filter är ogiltigt (400) */}
      {error && <p className="text-red-600">Kunde inte hämta boenden: {error}</p>}
      {!loading && !error && properties.length === 0 && <p>Inga boenden matchar sökningen.</p>}

      {!loading && !error && (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* key = unikt id så att React vet vilket element som är vilket */}
          {properties.map((property) => (
            <li key={property.id}>
              <PropertyCard property={property} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
