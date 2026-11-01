import { Hono } from "hono";
import type { Property } from "../types/property.js";
import { validate } from "../middleware/validate.js";
import {
  createPropertySchema,
  updatePropertySchema,
  idParamSchema,
} from "../validators/property.js";
import type { AppEnv } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";

const propertiesApp = new Hono<AppEnv>();

propertiesApp.get("/", async (c) => {
  const { data, error } = await c.var.supabase.from("properties").select("*");
  if (error) throw new Error(error.message);
  return c.json(data as Property[]);
});

propertiesApp.get("/:id", validate("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const { data, error } = await c.var.supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return c.json({ error: "Property not found" }, 404);
  return c.json(data as Property);
});

propertiesApp.post("/", requireAuth, validate("json", createPropertySchema), async (c) => {
  const body = c.req.valid("json");
  const { data, error } = await c.var.supabase
    .from("properties")
    .insert(body)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return c.json(data as Property, 201);
});

propertiesApp.patch(
  "/:id",
  requireAuth,
  validate("param", idParamSchema),
  validate("json", updatePropertySchema),
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
    if (!data) return c.json({ error: "Property not found" }, 404);
    return c.json(data as Property);
  },
);

propertiesApp.delete("/:id", requireAuth, validate("param", idParamSchema), async (c) => {
  const { id } = c.req.valid("param");
  const { data, error } = await c.var.supabase
    .from("properties")
    .delete()
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return c.json({ error: "Property not found" }, 404);
  return c.json({ message: "Property deleted" });
});

export default propertiesApp;
