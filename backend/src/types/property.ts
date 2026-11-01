import type { z } from "zod";
import type { createPropertySchema } from "../validators/property.js";

// G16: Typerna skapas FRÅN Zod-schemat med z.infer – en enda källa till sanning.
// Ändras schemat ändras typen automatiskt, så de kan aldrig bli olika.
// NewProperty = det klienten får skicka in.
export type NewProperty = z.infer<typeof createPropertySchema>;

// Property = ett boende från databasen: allt i NewProperty + det databasen sätter själv.
// & = intersection type (går med type, inte med interface).
export type Property = NewProperty & {
  id: string;
  owner_id: string | null;
  created_at: string;
};
