import { z } from "zod";

// Regler för registrering och inloggning. (G1, G10)
export const authSchema = z.object({
  // Ogiltig e-post nekas med 400 innan Supabase ens anropas.
  email: z.email("Ogiltig e-postadress"),
  // Supabase kräver minst 6 tecken som standard.
  password: z.string().min(6, "Lösenordet måste vara minst 6 tecken"),
});
