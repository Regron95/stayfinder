"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

// G3: Menyn visar olika innehåll för inloggad användare och utloggad besökare.
// OBS: att dölja länkar är bara för användarupplevelsen – det är backenden och RLS
// som faktiskt skyddar datan.
export default function Nav() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/"); // tillbaka till startsidan efter utloggning
  }

  return (
    <nav className="mx-auto flex max-w-4xl items-center gap-6 p-4">
      <Link href="/" className="text-xl font-bold">StayFinder</Link>
      <Link href="/" className="hover:underline">Boenden</Link>

      {/* ml-auto = trycker resten till höger */}
      <div className="ml-auto flex items-center gap-4">
        {/* Visa inget medan /auth/me svarar – annars blinkar "Logga in" förbi */}
        {loading ? null : user ? (
          <>
            <Link href="/properties/new" className="hover:underline">Nytt boende</Link>
            <Link href="/bookings" className="hover:underline">Mina bokningar</Link>
            {/* G2: appen visar alltid vem som är inloggad */}
            <span className="text-gray-600">{user.email}</span>
            <button onClick={handleLogout} className="underline">Logga ut</button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:underline">Logga in</Link>
            <Link href="/register" className="hover:underline">Skapa konto</Link>
          </>
        )}
      </div>
    </nav>
  );
}
