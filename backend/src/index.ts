import { Hono } from "hono";
import { serve } from "@hono/node-server";
import propertiesApp from "./routes/properties.js";

//Lagar appen
const app = new Hono();

//Health check route
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

//Lägger till route för fastigheter
app.route("/properties", propertiesApp);

//startar servern på port 3000 och loggar att servern är igång
serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});
