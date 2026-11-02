"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

// Det som alla komponenter kan läsa med useAuth()
type AuthContextValue = {
  user: User | null; // null = utloggad
  loading: boolean; // true tills /auth/me har svarat
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
};

// Context = ett sätt att dela data med alla komponenter utan att skicka props genom varje nivå
const AuthContext = createContext<AuthContextValue | null>(null);

// Omsluter hela appen i layout.tsx, så att menyn och alla sidor vet vem som är inloggad
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // G2: När sidan laddas (eller laddas om) frågar vi backenden vem som är inloggad.
  // Cookien är httpOnly – JavaScript kan inte läsa den, men fetch skickar med den
  // (credentials: "include"), och backenden svarar med användaren eller 401.
  useEffect(() => {
    api<{ user: User }>("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null)) // 401 = inte inloggad, inget fel att visa
      .finally(() => setLoading(false));
  }, []);

  // G1: Backenden tar bort sessionen och cookien, sedan glömmer frontenden användaren
  async function logout() {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Egen hook: const { user } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  // Ger ett tydligt fel om någon glömmer <AuthProvider> – och gör att TS vet att context inte är null
  if (!context) throw new Error("useAuth måste användas inuti <AuthProvider>");
  return context;
}
