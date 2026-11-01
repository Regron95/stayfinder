import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import type { User } from "@supabase/supabase-js";
import { env } from "../env.js";

// Skapar en NY Supabase-klient för varje request.
// Klienten läser användarens session från cookien och skickar token vidare till databasen,
// så att RLS vet vem som anropar (auth.uid()). Utan cookie körs anropen som "anon".
// SÄKERHET: en gemensam klient skulle kunna blanda ihop användare som anropar samtidigt.
export const createSupabaseClient = (c: Context) =>
  createServerClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      // Supabase frågar: vilka cookies skickade webbläsaren?
      getAll() {
        return parseCookieHeader(c.req.header("Cookie") ?? "").map(
          ({ name, value }) => ({ name, value: value ?? "" }),
        );
      },
      // Supabase säger: spara de här cookiesen (vid login/logout).
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          setCookie(c, name, value, {
            ...options,
            // SÄKERHET: JavaScript i webbläsaren kan inte läsa cookien → skydd mot XSS.
            httpOnly: true,
            // SÄKERHET: cookien skickas inte med anrop som andra sajter startar → skydd mot CSRF.
            sameSite: "Lax",
          });
        });
      },
    },
  });

// Det som middlewares lägger på c.var, så att c.var.supabase och c.var.user är typade. (G16)
// ReturnType = typen på det funktionen returnerar, så vi slipper skriva den själva.
export type AppEnv = {
  Variables: {
    supabase: ReturnType<typeof createSupabaseClient>;
    user: User;
  };
};
