import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import type { User } from "@supabase/supabase-js";
import { env } from "../env.js";

export const createSupabaseClient = (c: Context) => createServerClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
  cookies: {
    getAll () {
      return parseCookieHeader(c.req.header("Cookie") ?? "").map(({ name, value }) => ({ name, value: value ?? "" }));
    },
    setAll (cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        setCookie(c, name, value, {
          ...options,
          httpOnly: true,
          sameSite: "Lax",
        });   
      });
    },
  },
});

export type AppEnv = {
  Variables: {
    supabase: ReturnType<typeof createSupabaseClient>;
    user: User;
  };
};