import { Hono } from "hono";
import { serve } from "@hono/node-server";
import propertiesApp from "./routes/properties.js";
import { HTTPException } from "hono/http-exception";
import { env } from "./env.js";
import { supabaseMiddleware } from "./middleware/auth.js";
import type { AppEnv } from "./lib/supabase.js";
import authApp from "./routes/auth.js";

//Lägger till middleware för att hantera Supabase-klienten och autentisering
const app = new Hono<AppEnv>();

// Skapar en Supabase-klient per request (läser användarens cookie)
app.use(supabaseMiddleware);

//Health check route
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

//Lägger till route för fastigheter
app.route("/properties", propertiesApp);
app.route("/auth", authApp);

app.notFound((c) => {
  return c.json({ error: "Route not found" }, 404);
});
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

//startar serveren
serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});
