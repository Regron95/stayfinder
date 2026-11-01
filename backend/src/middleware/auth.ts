import type { MiddlewareHandler } from "hono";
import { createSupabaseClient, type AppEnv } from "../lib/supabase.js";

export const supabaseMiddleware: MiddlewareHandler<AppEnv> = async (
  c,
  next,
) => {
  c.set("supabase", createSupabaseClient(c));
  await next();
};

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const {
    data: { user },
  } = await c.var.supabase.auth.getUser();

  if (!user) {
    return c.json({ error: "Du måste vara inloggad" }, 401);
  }

  c.set("user", user);
  await next();
};
