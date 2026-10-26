import { Hono } from "hono";
import type { NewProperty, Property } from "../types/property.js";

// Mock data för fastigheter > Supabase ska användas i framtiden
const properties: Property[] = [
  {
    id: "1",
    title: "Stuga vid sjön",
    description: "Mysig stuga med egen brygga vid sjön.",
    location: "Dalarna, Sverige",
    price_per_night: 900,
    max_guests: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Lägenhet i city",
    description: "Nära tunnelbanan",
    location: "Stockholm, Sverige",
    price_per_night: 1400,
    max_guests: 2,
    created_at: new Date().toISOString(),
  },
];

// Skapar en ny Hono-app för fastigheter
const propertiesApp = new Hono();

// Route för att hämta alla fastigheter
propertiesApp.get("/", (c) => {
  return c.json(properties);
});

// Route för att hämta en fastighet baserat på ID
propertiesApp.get("/:id", (c) => {
  const { id } = c.req.param();
  const property = properties.find((p) => p.id === id);
  if (!property) {
    return c.json({ error: "Property not found" }, 404);
  }
  return c.json(property);
});

// Route för att skapa en ny fastighet
propertiesApp.post("/", async (c) => {
  const body = await c.req.json<NewProperty>();

  const newProperty: Property = {
    ...body,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  properties.push(newProperty);
  return c.json(newProperty, 201);
});

// Route för att uppdatera en fastighet baserat på ID
propertiesApp.patch("/:id", async (c) => {
  const { id } = c.req.param();
  const index = properties.findIndex((p) => p.id === id);

  if (index === -1) {
    return c.json({ error: "Property not found" }, 404);
  }
  const body = await c.req.json<Partial<NewProperty>>();
  const existing = properties[index];

  const updated: Property = {
    ...existing,
    ...body,
    id: existing.id,
    created_at: existing.created_at,
  };
  properties[index] = updated;
  return c.json(updated);
});

// Route för att ta bort en fastighet baserat på ID
propertiesApp.delete("/:id", (c) => {
  const { id } = c.req.param();
  const index = properties.findIndex((p) => p.id === id);

  if (index === -1) {
    return c.json({ error: "Property not found" }, 404);
  }

  properties.splice(index, 1);
  return c.json({ message: "Property deleted" });
});

export default propertiesApp;
