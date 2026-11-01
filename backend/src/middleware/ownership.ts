import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../lib/supabase.js";

// G15/VG: Bara ägaren får ändra eller ta bort sitt boende.
// Körs EFTER requireAuth (vi behöver c.var.user) och validate("param") (id är en giltig UUID).
// Row Level Security(RLS) stoppar också detta i databasen, men då blir svaret en tyst 404.
// Den här kontrollen ger istället en tydlig 403. Reglerna gäller alltså i både API och databas.
export const requirePropertyOwner: MiddlewareHandler<AppEnv> = async (
  c,
  next,
) => {
  const id = c.req.param("id");

  // Hämtar bara owner_id – vi behöver inget mer (dataminimering).
  const { data, error } = await c.var.supabase
    .from("properties")
    .select("owner_id")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  // Boendet finns inte → 404 (inte 403, det finns inget att äga).
  if (!data) return c.json({ error: "Property not found" }, 404);

  // 401 = vem är du? 403 = jag vet vem du är, men du får inte.
  if (data.owner_id !== c.var.user.id) {
    return c.json({ error: "Du får bara ändra dina egna boenden" }, 403);
  }

  // Ägaren stämmer → släpp vidare till nästa middleware/handler.
  await next();
};
