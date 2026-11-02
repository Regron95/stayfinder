"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import BookingList from "@/components/BookingList";

// G12: "Mina bokningar" – de bokningar jag själv har gjort (GET /bookings)
export default function MyBookingsPage() {
  const { user, loading } = useAuth();

  if (loading) return <p className="p-8">Laddar...</p>;

  // Utloggad: backenden skulle ändå svara 401 (requireAuth)
  if (!user) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-bold">Mina bokningar</h1>
        <p className="mt-2">
          <Link href="/login" className="underline">Logga in</Link> för att se dina bokningar.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Mina bokningar</h1>
      <BookingList path="/bookings" title="Alla mina bokningar" emptyText="Du har inga bokningar än."
        showPropertyLink />
    </main>
  );
}
