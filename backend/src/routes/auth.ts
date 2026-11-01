import { Hono } from "hono";
import type { AppEnv } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { authSchema } from "../validators/auth.js";

const authApp = new Hono<AppEnv>();

// G1: Skapa konto. 201 om det lyckas, 400 om e-posten redan finns eller datan är ogiltig.
authApp.post("/register", validate("json", authSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  const { data, error } = await c.var.supabase.auth.signUp({ email, password });

  if (error) return c.json({ error: error.message }, 400);
  // SÄKERHET: skicka bara id och e-post, inte hela användarobjektet (data minimization).
  return c.json({ user: { id: data.user?.id, email: data.user?.email } }, 201);
});

// G1: Logga in. Supabase sparar sessionen i en httpOnly-cookie via setAll i lib/supabase.ts.
authApp.post("/login", validate("json", authSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  const { data, error } = await c.var.supabase.auth.signInWithPassword({
    email,
    password,
  });

  // SÄKERHET: samma meddelande oavsett om e-posten finns eller lösenordet är fel,
  // så att ingen kan ta reda på vilka e-postadresser som har konto (user enumeration).
  if (error) return c.json({ error: "Fel e-post eller lösenord" }, 401);
  return c.json({ user: { id: data.user.id, email: data.user.email } });
});

// G1: Logga ut. Supabase tar bort sessionen och cookien sätts till Max-Age=0.
authApp.post("/logout", async (c) => {
  const { error } = await c.var.supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return c.json({ message: "Utloggad" });
});

// G2: Vem är inloggad? Frontenden anropar denna när sidan laddas om.
authApp.get("/me", requireAuth, (c) => {
  return c.json({ user: { id: c.var.user.id, email: c.var.user.email } });
});

export default authApp;
