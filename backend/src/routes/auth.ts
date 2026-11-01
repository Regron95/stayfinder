import { Hono } from "hono";
import type { AppEnv } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { authSchema } from "../validators/auth.js";

const authApp = new Hono<AppEnv>();

authApp.post("/register", validate("json", authSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  const { data, error } = await c.var.supabase.auth.signUp({ email, password });

  if (error) return c.json({ error: error.message }, 400);
  return c.json({ user: { id: data.user?.id, email: data.user?.email } }, 201);
});

authApp.post("/login", validate("json", authSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  const { data, error } = await c.var.supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return c.json({ error: "Fel e-post eller lösenord" }, 401);
  return c.json({ user: { id: data.user.id, email: data.user.email } });
});

authApp.post("/logout", async (c) => {
  const { error } = await c.var.supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return c.json({ message: "Utloggad" });
});

authApp.get("/me", requireAuth, (c) => {
  return c.json({ user: { id: c.var.user.id, email: c.var.user.email } });
});

export default authApp;
