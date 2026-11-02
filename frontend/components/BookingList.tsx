"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Booking } from "@/lib/types";
import BookingItem from "@/components/BookingItem";

type Props = {
  path: string; // "/bookings" eller "/properties/:id/bookings"
  title: string;
  emptyText: string;
  showPropertyLink?: boolean;
};

// G12: Hämtar och visar en lista med bokningar. Används på detaljsidan och på "Mina bokningar".
// RLS i databasen avgör vad som kommer tillbaka: gästen ser sina egna, ägaren ser alla (VG1).
export default function BookingList({ path, title, emptyText, showPropertyLink }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Booking[]>(path)
      .then(setBookings)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [path]);

  // Byter ut den ändrade bokningen i listan – map ger en NY array (React kräver det)
  function handleUpdated(updated: Booking) {
    setBookings(bookings.map((b) => (b.id === updated.id ? updated : b)));
  }

  // Tar bort bokningen ur listan utan att hämta allt igen
  function handleDeleted(id: string) {
    setBookings(bookings.filter((b) => b.id !== id));
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {/* G13: laddar, fel, tom lista eller data */}
      {loading && <p>Laddar bokningar...</p>}
      {error && <p className="text-red-600">Kunde inte hämta bokningar: {error}</p>}
      {!loading && !error && bookings.length === 0 && <p className="text-gray-600">{emptyText}</p>}
      <ul className="flex flex-col gap-3">
        {bookings.map((booking) => (
          <BookingItem key={booking.id} booking={booking} showPropertyLink={showPropertyLink}
            onUpdated={handleUpdated} onDeleted={handleDeleted} />
        ))}
      </ul>
    </section>
  );
}
