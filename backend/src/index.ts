import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { HTTPException } from "hono/http-exception";
import { env } from "./env.js";
import { supabaseMiddleware } from "./middleware/auth.js";
import type { AppEnv } from "./lib/supabase.js";
import propertiesApp from "./routes/properties.js";
import authApp from "./routes/auth.js";
import bookingsApp from "./routes/bookings.js";

// AppEnv gör c.var.supabase och c.var.user typade i alla routes. (G16)
const app = new Hono<AppEnv>();

// Körs på ALLA requests: skapar en Supabase-klient per request som läser användarens cookie.
// Måste stå före app.route – middleware körs i den ordning de registreras.
app.use(supabaseMiddleware);

// Health check: visar att API:t lever, utan att röra databasen.
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Monterar route-filerna, t.ex. "/" i properties.ts blir /properties.
app.route("/properties", propertiesApp);
app.route("/auth", authApp);
// Bokningar har egna fulla sökvägar (/bookings och /properties/:id/bookings), därför "/".
app.route("/", bookingsApp);

// Ingen route matchade → 404 som JSON istället för Honos text. (G14)
app.notFound((c) => {
  return c.json({ error: "Route not found" }, 404);
});

// Fångar alla fel som kastas i routes.
app.onError((err, c) => {
  // Fel som Hono kastar med flit (t.ex. trasig JSON → 400) behåller sin statuskod.
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  // SÄKERHET: detaljerna loggas bara på servern. Klienten får ett generellt fel
  // så att stack traces, SQL eller filsökvägar inte läcker ut (information disclosure).
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

// Startar HTTP-servern. Porten kommer från env så att den kan ändras i produktion.
serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});
