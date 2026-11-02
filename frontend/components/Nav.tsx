"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

// G3: Menyn visar olika innehåll för inloggad användare och utloggad besökare.
// OBS: att dölja länkar är bara för användarupplevelsen – det är backenden och RLS
// som faktiskt skyddar datan.
export default function Nav() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  // Mobil: är menyluckan öppen?
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/"); // tillbaka till startsidan efter utloggning
  }

  // Länkarna skrivs EN gång och visas på två ställen: i raden (dator) och i luckan (mobil)
  const links = loading ? null : user ? (
    <>
      <Link href="/" className="hover:underline">Boenden</Link>
      <Link href="/properties/new" className="hover:underline">Nytt boende</Link>
      <Link href="/bookings" className="hover:underline">Mina bokningar</Link>
      {/* G2: appen visar alltid vem som är inloggad */}
      <span className="text-gray-600">{user.email}</span>
      <button onClick={handleLogout} className="text-left underline">Logga ut</button>
    </>
  ) : (
    <>
      <Link href="/" className="hover:underline">Boenden</Link>
      <Link href="/login" className="hover:underline">Logga in</Link>
      <Link href="/register" className="btn">Skapa konto</Link>
    </>
  );

  return (
    <nav className="mx-auto max-w-5xl px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-rose-500">StayFinder</Link>

        {/* Dator: länkarna på en rad. hidden = dold på mobil, md:flex = synlig från 768 px */}
        <div className="hidden items-center gap-5 md:flex">{links}</div>

        {/* Mobil: knapp som öppnar/stänger luckan. md:hidden = dold på dator */}
        <button onClick={() => setOpen(!open)} aria-label="Meny" aria-expanded={open}
          className="rounded-lg border border-gray-300 px-3 py-1 text-xl md:hidden">
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobil: luckan med länkarna under varandra. Klick på en länk stänger luckan
          (klicket "bubblar" upp till diven). */}
      {open && (
        <div onClick={() => setOpen(false)}
          className="mt-4 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-md md:hidden">
          {links}
        </div>
      )}
    </nav>
  );
}
