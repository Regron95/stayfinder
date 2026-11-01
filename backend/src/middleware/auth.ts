import type { MiddlewareHandler } from "hono";
import { createSupabaseClient, type AppEnv } from "../lib/supabase.js";

// Körs på alla requests (app.use i index.ts): lägger en Supabase-klient på c.var.supabase.
export const supabaseMiddleware: MiddlewareHandler<AppEnv> = async (
  c,
  next,
) => {
  c.set("supabase", createSupabaseClient(c));
  await next();
};

// Används på routes som kräver inloggning. (G6, G14)
// getUser() verifierar token hos Supabase – vi litar inte blint på det som står i cookien.
export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const {
    data: { user },
  } = await c.var.supabase.auth.getUser();

  // Ingen giltig inloggning → 401 och requesten stoppas här, handlern körs aldrig.
  if (!user) {
    return c.json({ error: "Du måste vara inloggad" }, 401);
  }

  // Handlern får veta vem som är inloggad via c.var.user.
  c.set("user", user);
  await next();
};
