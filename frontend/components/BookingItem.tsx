"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { countNights, statusLabel } from "@/lib/booking";
import type { Booking } from "@/lib/types";
import FieldError from "@/components/FieldError";

type Props = {
  booking: Booking;
  showPropertyLink?: boolean; // ? = valfri prop, används på "Mina bokningar"
  onUpdated: (booking: Booking) => void;
  onDeleted: (id: string) => void;
};

// G12: Visa, ändra, avboka och ta bort en bokning
export default function BookingItem({ booking, showPropertyLink, onUpdated, onDeleted }: Props) {
  const { user } = useAuth();

  const [editing, setEditing] = useState(false);
  // Utkast för redigeringen – startar med bokningens nuvarande värden
  const [draft, setDraft] = useState({
    check_in: booking.check_in,
    check_out: booking.check_out,
    guests: String(booking.guests),
  });
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  // VG1: bara gästen själv får ändra. Ägaren av boendet ser bokningen men kan inte ändra den
  // (backenden svarar 403 via requireBookingOwner). Avbokad bokning kan inte ändras (triggern).
  const isOwn = user?.id === booking.user_id;
  const canEdit = isOwn && booking.status !== "cancelled";

  function update(e: ChangeEvent<HTMLInputElement>) {
    setDraft({ ...draft, [e.target.name]: e.target.value });
  }

  // Gemensam funktion för alla anrop: nollställer fel, visar fel från backenden
  async function run(action: () => Promise<void>) {
    setError(null);
    setFields({});
    setBusy(true);
    try {
      await action();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message); // t.ex. 409 "Boendet är redan bokat dessa datum"
        setFields(err.fields ?? {});
      } else {
        setError("Kunde inte nå servern");
      }
    } finally {
      setBusy(false);
    }
  }

  // PATCH med nya datum/gäster. Totalpriset räknas om i databasen (VG6).
  const save = () =>
    run(async () => {
      const updated = await api<Booking>(`/bookings/${booking.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...draft, guests: Number(draft.guests) }),
      });
      onUpdated(updated);
      setEditing(false);
    });

  // Avboka = PATCH status → cancelled (den enda statusändringen backenden tillåter)
  const cancel = () =>
    run(async () => {
      const updated = await api<Booking>(`/bookings/${booking.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelled" }),
      });
      onUpdated(updated);
    });

  const remove = () => {
    // confirm = webbläsarens "OK / Avbryt"-ruta, så att man inte tar bort av misstag
    if (!window.confirm("Ta bort bokningen?")) return;
    run(async () => {
      await api(`/bookings/${booking.id}`, { method: "DELETE" });
      onDeleted(booking.id);
    });
  };

  const nights = countNights(booking.check_in, booking.check_out);

  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold">
          {booking.check_in} → {booking.check_out} · {nights} nätter · {booking.guests} gäster
        </p>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-800">
          {statusLabel[booking.status]}
        </span>
      </div>
      <p className="text-gray-600">{booking.guest_name} · {booking.guest_email}</p>
      <p>Totalpris: {booking.total_price} kr</p>
      {/* Visar att bokningen är någon annans – ägaren av boendet ser alla (VG1) */}
      {!isOwn && <p className="text-sm text-gray-600">Bokad av en gäst</p>}
      {showPropertyLink && (
        <Link href={`/properties/${booking.property_id}`} className="text-sm underline">Visa boendet</Link>
      )}

      {editing && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            Incheckning
            <input name="check_in" type="date" value={draft.check_in} onChange={update}
              className="input" />
            <FieldError messages={fields.check_in} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Utcheckning
            <input name="check_out" type="date" value={draft.check_out} onChange={update}
              className="input" />
            <FieldError messages={fields.check_out} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Gäster
            <input name="guests" type="number" min="1" value={draft.guests} onChange={update}
              className="input" />
            <FieldError messages={fields.guests} />
          </label>
        </div>
      )}

      {error && <p className="mt-2 text-red-600">{error}</p>}

      {/* Knapparna visas bara för gästen själv – men skyddet sitter i backenden och RLS */}
      {canEdit && (
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          {editing ? (
            <>
              <button onClick={save} disabled={busy} className="btn">
                Spara
              </button>
              <button onClick={() => setEditing(false)} disabled={busy} className="underline">Avbryt</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} disabled={busy} className="underline">Ändra</button>
              <button onClick={cancel} disabled={busy} className="underline">Avboka</button>
            </>
          )}
        </div>
      )}
      {isOwn && (
        <button onClick={remove} disabled={busy} className="mt-2 text-sm text-red-600 underline">
          Ta bort
        </button>
      )}
    </li>
  );
}
