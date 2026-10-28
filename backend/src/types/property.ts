import type { z } from "zod";
import type { createPropertySchema } from "../validators/property.js";

//Används för att definiera typer för fastigheter. NewProperty är typen för en ny fastighet som ska skapas, medan Property är typen för en fastighet som redan finns i systemet och har ett id och ett created_at fält.
export type NewProperty = z.infer<typeof createPropertySchema>;

export type Property = NewProperty & {
  id: string;
  created_at: string;
};
