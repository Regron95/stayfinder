import { Hono } from "hono";
import { serve } from "@hono/node-server";
import propertiesApp from "./routes/properties.js";
import { HTTPException } from "hono/http-exception";

//Lagar appen
const app = new Hono();

//Health check route
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

//Lägger till route för fastigheter
app.route("/properties", propertiesApp);

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

//startar servern på port 3000 och loggar att servern är igång
serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});
