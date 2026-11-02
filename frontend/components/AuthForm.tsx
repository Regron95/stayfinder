"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { User } from "@/lib/types";

// Samma formulär för båda sidorna – mode styr vilken endpoint som anropas.
// Union type: bara "login" eller "register" är tillåtet.
type Props = { mode: "login" | "register" };

// G1: Skapa konto och logga in
export default function AuthForm({ mode }: Props) {
  const { setUser } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // error = övergripande fel, fields = fel per fält från backendens Zod-validering
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string[]>>({});
  // Hindrar dubbelklick medan anropet pågår
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFields({});
    setSubmitting(true);

    try {
      // POST /auth/login eller /auth/register. Backenden sätter httpOnly-cookien i svaret.
      const data = await api<{ user: User }>(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setUser(data.user); // menyn uppdateras direkt
      router.push("/");
    } catch (err) {
      // ApiError = backenden svarade med 400/401. Annars nådde vi inte servern alls.
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

  return (
    <main className="mx-auto w-full max-w-sm p-8">
      <h1 className="mb-6 text-2xl font-bold">{isLogin ? "Logga in" : "Skapa konto"}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          E-post
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="input" required />
          {/* fields.email?.[0] = första felet för e-post, om det finns */}
          {fields.email && <span className="text-sm text-red-600">{fields.email[0]}</span>}
        </label>

        <label className="flex flex-col gap-1">
          Lösenord
          {/* type="password" döljer tecknen. autoComplete hjälper lösenordshanterare. */}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            className="input" required />
          {fields.password && <span className="text-sm text-red-600">{fields.password[0]}</span>}
        </label>

        {error && <p className="text-red-600">{error}</p>}

        <button type="submit" disabled={submitting}
          className="btn">
          {submitting ? "Vänta..." : isLogin ? "Logga in" : "Skapa konto"}
        </button>
      </form>

      {/* Länk till den andra sidan */}
      <p className="mt-4 text-sm">
        {isLogin ? "Inget konto? " : "Har du redan ett konto? "}
        <Link href={isLogin ? "/register" : "/login"} className="underline">
          {isLogin ? "Skapa konto" : "Logga in"}
        </Link>
      </p>
    </main>
  );
}
