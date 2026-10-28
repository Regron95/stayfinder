import { z } from "zod";

export const createPropertySchema = z.object({
  // trim() före min() så att "   " (bara mellanslag) inte räknas som en giltig titel
  title: z.string().trim().min(2, "Titeln måste vara minst 2 tecken"),
  description: z.string().trim().min(1, "Beskrivning krävs"),
  location: z.string().trim().min(1, "Plats krävs"),
  // number() stoppar text som "gratis", positive() stoppar 0 och negativa priser
  price_per_night: z.number().positive("Priset måste vara större än 0"),
  // int() eftersom man inte kan ha 2,5 gäster
  max_guests: z
    .number()
    .int("Antal gäster måste vara ett heltal")
    .min(1, "Minst 1 gäst"),
});

// Schema för att ändra ett boende (PATCH). Samma regler, men alla fält är valfria
// eftersom klienten bara skickar det som ska ändras.
export const updatePropertySchema = createPropertySchema.partial();
