import { z } from "zod";

// Regler för ett nytt boende (POST). Kontrolleras i runtime, till skillnad från typer
// som försvinner vid kompilering. Okända fält (t.ex. id, owner_id) tas bort automatiskt
// – skydd mot mass assignment. (G10, G14)
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
// refine: en tom body {} nekas med 400 istället för att ge en missvisande 404.
export const updatePropertySchema = createPropertySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minst ett fält måste anges",
  });

// id i URL:en måste vara en UUID. Annars kastar databasen ett fel → 500.
// Med den här kontrollen blir det istället 400. (G14)
export const idParamSchema = z.object({
  id: z.uuid("Ogiltigt id"),
});

// G5/G8: Filter och sortering i URL:en, t.ex. ?location=stockholm&max_price=1000&sort=price_asc
// Query-parametrar är ALLTID text → z.coerce gör om "1000" till 1000 (samma som PORT i env.ts).
// Alla fält är valfria: utan filter visas alla boenden.
export const propertyQuerySchema = z.object({
  location: z.string().trim().min(1).optional(),
  max_price: z.coerce
    .number("Maxpris måste vara ett tal")
    .positive("Maxpris måste vara större än 0")
    .optional(),
  guests: z.coerce
    .number("Antal gäster måste vara ett tal")
    .int("Antal gäster måste vara ett heltal")
    .min(1, "Minst 1 gäst")
    .optional(),
  // enum: bara dessa två värden är tillåtna, allt annat → 400
  sort: z
    .enum(
      ["price_asc", "price_desc"],
      "Sortering måste vara 'price_asc' eller 'price_desc'",
    )
    .optional(),
});
