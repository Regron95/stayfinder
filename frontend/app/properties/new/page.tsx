"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Property } from "@/lib/types";
import FieldError from "@/components/FieldError";

// Formulärets fält. Alla är strängar eftersom <input> alltid ger text.
type PropertyForm = {
  title: string;
  description: string;
  location: string;
  price_per_night: string;
  max_guests: string;
};

const emptyForm: PropertyForm = {
  title: "",
  description: "",
  location: "",
  price_per_night: "",
  max_guests: "",
};

// G7: En inloggad användare skapar ett nytt boende.
// /properties/new är en statisk route och vinner över /properties/[id].
export default function NewPropertyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Ett state-objekt för hela formuläret istället för fem useState
  const [form, setForm] = useState<PropertyForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  // En gemensam onChange: name-attributet säger vilket fält som ändras.
  // ...form kopierar de andra fälten, [name] = dynamisk nyckel.
  function update(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFields({});
    setSubmitting(true);

    try {
      // Backenden kräver tal (z.number), så text görs om med Number().
      // Tomt fält → Number("") = 0 → backenden svarar "Priset måste vara större än 0".
      // owner_id skickas INTE – databasen sätter det med default auth.uid() (VG1).
      const created = await api<Property>("/properties", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          price_per_night: Number(form.price_per_night),
          max_guests: Number(form.max_guests),
        }),
      });
      // 201 → gå till det nya boendets detaljsida
      router.push(`/properties/${created.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFields(err.fields ?? {});
      } else {
        setError("Kunde inte nå servern");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="p-8">Laddar...</p>;

  // Utloggad: visa uppmaning istället för formuläret.
  // Skyddet sitter ändå i backenden (requireAuth → 401) och i databasen (RLS).
  if (!user) {
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-bold">Nytt boende</h1>
        <p className="mt-2">
          Du måste <Link href="/login" className="underline">logga in</Link> för att skapa ett boende.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Nytt boende</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          Titel
          <input name="title" value={form.title} onChange={update} className="rounded border p-2" />
          <FieldError messages={fields.title} />
        </label>

        <label className="flex flex-col gap-1">
          Beskrivning
          <textarea name="description" value={form.description} onChange={update} rows={4}
            className="rounded border p-2" />
          <FieldError messages={fields.description} />
        </label>

        <label className="flex flex-col gap-1">
          Plats
          <input name="location" value={form.location} onChange={update} className="rounded border p-2" />
          <FieldError messages={fields.location} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            Pris per natt (kr)
            <input name="price_per_night" type="number" min="1" value={form.price_per_night}
              onChange={update} className="rounded border p-2" />
            <FieldError messages={fields.price_per_night} />
          </label>

          <label className="flex flex-col gap-1">
            Max antal gäster
            <input name="max_guests" type="number" min="1" step="1" value={form.max_guests}
              onChange={update} className="rounded border p-2" />
            <FieldError messages={fields.max_guests} />
          </label>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button type="submit" disabled={submitting}
          className="rounded bg-black p-2 text-white disabled:opacity-50">
          {submitting ? "Sparar..." : "Skapa boende"}
        </button>
      </form>
    </main>
  );
}
