"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { countNights, today } from "@/lib/booking";
import type { Booking, Property } from "@/lib/types";
import FieldError from "@/components/FieldError";

type Props = {
  property: Property;
  onBooked: () => void; // säger till detaljsidan att hämta bokningslistan igen
};

const emptyForm = { guest_name: "", guest_email: "", guests: "1", check_in: "", check_out: "" };

// G9: Boka från detaljsidan. G10: fel visas vid rätt fält. G11: nätter och totalpris.
export default function BookingForm({ property, onBooked }: Props) {
  const { user, loading } = useAuth();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // G11: räknas om vid varje render, alltså varje gång ett datum ändras.
  // Bara en FÖRHANDSVISNING – det riktiga priset räknas ut i databasen (VG6).
  const nights = countNights(form.check_in, form.check_out);
  const total = nights * property.price_per_night;

  function update(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFields({});
    setSuccess(null);
    setSubmitting(true);

    try {
      // Inget pris skickas – servern räknar ut det (VG6). guests måste vara ett tal.
      const booking = await api<Booking>(`/properties/${property.id}/bookings`, {
        method: "POST",
        body: JSON.stringify({ ...form, guests: Number(form.guests) }),
      });
      // Visa priset som SERVERN räknade ut, inte vårt eget
      setSuccess(`Bokningen är skapad! Totalpris: ${booking.total_price} kr`);
      setForm(emptyForm);
      onBooked();
    } catch (err) {
      // G10: 400 → fältfel, 409 → "Boendet är redan bokat dessa datum" (VG2)
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

  if (loading) return null;

  // G9: utloggad besökare uppmanas att logga in
  if (!user) {
    return (
      <section className="mt-8 rounded-lg border p-4">
        <h2 className="text-xl font-semibold">Boka</h2>
        <p className="mt-2">
          <Link href="/login" className="underline">Logga in</Link> för att boka detta boende.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-lg border p-4">
      <h2 className="mb-4 text-xl font-semibold">Boka</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            Namn
            <input name="guest_name" value={form.guest_name} onChange={update} className="rounded border p-2" />
            <FieldError messages={fields.guest_name} />
          </label>
          <label className="flex flex-col gap-1">
            E-post
            <input name="guest_email" type="email" value={form.guest_email} onChange={update}
              className="rounded border p-2" />
            <FieldError messages={fields.guest_email} />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1">
            Incheckning
            {/* type="date" ger alltid "YYYY-MM-DD" – samma format som z.iso.date i backenden */}
            <input name="check_in" type="date" min={today()} value={form.check_in} onChange={update}
              className="rounded border p-2" />
            <FieldError messages={fields.check_in} />
          </label>
          <label className="flex flex-col gap-1">
            Utcheckning
            <input name="check_out" type="date" min={form.check_in || today()} value={form.check_out}
              onChange={update} className="rounded border p-2" />
            <FieldError messages={fields.check_out} />
          </label>
          <label className="flex flex-col gap-1">
            Gäster (max {property.max_guests})
            <input name="guests" type="number" min="1" max={property.max_guests} value={form.guests}
              onChange={update} className="rounded border p-2" />
            <FieldError messages={fields.guests} />
          </label>
        </div>

        {/* G11: visas innan användaren bokar */}
        <p className="font-semibold">
          {nights > 0
            ? `${nights} ${nights === 1 ? "natt" : "nätter"} × ${property.price_per_night} kr = ${total} kr`
            : "Välj datum för att se totalpriset"}
        </p>

        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-700">{success}</p>}

        <button type="submit" disabled={submitting}
          className="rounded bg-black p-2 text-white disabled:opacity-50">
          {submitting ? "Bokar..." : "Boka"}
        </button>
      </form>
    </section>
  );
}
