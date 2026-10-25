import { Hono } from "hono";
import { serve } from "@hono/node-server";

 //Lagar appen
const app = new Hono();

//route för att kolla om servern är igång
app.get("/health", (c) => {
  return c.json({ status: "ok" }); 
  });
  
  //startar servern på port 3000 och loggar att servern är igång
  serve({ fetch: app.fetch, port: 3000 }, (info) => {
    console.log(`Server running on http://localhost:${info.port}`);
  });
