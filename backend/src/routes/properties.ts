import { Hono } from "hono";
import type { Property } from "../types/property.js";
import { validate } from "../middleware/validate.js";
import {
  createPropertySchema,
  updatePropertySchema,
  idParamSchema,
  propertyQuerySchema,
} from "../validators/property.js";
import type { AppEnv } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePropertyOwner } from "../middleware/ownership.js";

const propertiesApp = new Hono<AppEnv>();

// G4/G5/G8: Alla kan se boenden. Filter och sortering görs i DATABASEN, inte i frontenden.
propertiesApp.get("/", validate("query", propertyQuerySchema), async (c) => {
  const { location, max_price, guests, sort } = c.req.valid("query");

  // Bygger frågan steg för steg – varje filter läggs bara till om det skickades med.
  let query = c.var.supabase.from("properties").select("*");

  // ilike = skiftlägesokänslig sökning, % = "vad som helst före/efter" → "stock" hittar "Stockholm"
  if (location) query = query.ilike("location", `%${location}%`);
  // lte = less than or equal (≤)
  if (max_price !== undefined) query = query.lte("price_per_night", max_price);
  // gte = greater than or equal (≥): boendet måste rymma MINST så många gäster
  if (guests !== undefined) query = query.gte("max_guests", guests);
  if (sort)
    query = query.order("price_per_night", { ascending: sort === "price_asc" });

  // Först här skickas frågan till databasen.
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return c.json(data as Property[]);
});

// G4: Detaljsida för ett boende. 400 om id inte är en UUID, 404 om det inte finns. (G14)
propertiesApp.get("/:id", validate("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const { data, error } = await c.var.supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    // maybeSingle = en rad eller null (null → 404)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return c.json({ error: "Property not found" }, 404);
  return c.json(data as Property);
});

// G6/G7: Bara inloggade kan skapa. requireAuth först → utloggad får 401, inte 400.
propertiesApp.post(
  "/",
  requireAuth,
  validate("json", createPropertySchema),
  async (c) => {
    // Validerad data: trimmad text, okända fält (t.ex. id, owner_id) borttagna.
    const body = c.req.valid("json");
    const { data, error } = await c.var.supabase
      .from("properties")
      .insert(body)
      // select() efter insert = få tillbaka raden som skapades (RETURNING *)
      .select()
      .single();

    if (error) throw new Error(error.message);
    // 201 Created (G14). Databasen har satt id och created_at.
    return c.json(data as Property, 201);
  },
);

// G6: Bara inloggade kan ändra.
propertiesApp.patch(
  "/:id",
  requireAuth,
  validate("param", idParamSchema),
  validate("json", updatePropertySchema),
  requirePropertyOwner,
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const { data, error } = await c.var.supabase
      .from("properties")
      .update(body)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    // Ingen rad uppdaterades → boendet finns inte. (G14)
    if (!data) return c.json({ error: "Property not found" }, 404);
    return c.json(data as Property);
  },
);

// G6: Bara inloggade kan ta bort.
propertiesApp.delete(
  "/:id",
  requireAuth,
  validate("param", idParamSchema),
  requirePropertyOwner,
  async (c) => {
    const { id } = c.req.valid("param");
    const { data, error } = await c.var.supabase
      .from("properties")
      .delete()
      .eq("id", id)
      // select() efter delete = få veta OM något faktiskt togs bort
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return c.json({ error: "Property not found" }, 404);
    return c.json({ message: "Property deleted" });
  },
);

export default propertiesApp;
