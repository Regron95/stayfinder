"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Property } from "@/lib/types";

// G4: Detaljsida för ett boende. URL:en /properties/abc → id = "abc".
// Client Component: körs i webbläsaren (useParams, useState, fetch med cookie).
export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // [id] = körs igen om id:t i URL:en ändras
  useEffect(() => {
    api<Property>(`/properties/${id}`)
      .then(setProperty)
      .catch((err: Error) => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  // G13: laddningsvy
  if (loading) return <p className="p-8">Laddar boende...</p>;

  // G13: egen sida när boendet inte finns (404) eller id:t är ogiltigt (400)
  if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-bold">Boendet finns inte</h1>
        <p className="mt-2 text-gray-600">Det kan ha tagits bort, eller så är länken fel.</p>
        <Link href="/" className="mt-4 inline-block underline">
          ← Tillbaka till alla boenden
        </Link>
      </main>
    );
  }

  // G13: felvy för alla andra fel (t.ex. backenden är nere)
  if (error || !property) {
    return <p className="p-8 text-red-600">Kunde inte hämta boendet: {error?.message}</p>;
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link href="/" className="underline">← Alla boenden</Link>
      <h1 className="mt-4 text-3xl font-bold">{property.title}</h1>
      <p className="text-gray-600">{property.location}</p>
      <p className="mt-4">{property.description}</p>
      <p className="mt-4 font-semibold">
        {property.price_per_night} kr/natt · max {property.max_guests} gäster
      </p>
      {/* G9: bokningsformuläret kommer här i fas 11 */}
    </main>
  );
}
