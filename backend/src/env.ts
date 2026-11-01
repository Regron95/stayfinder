import { z } from "zod";

// Miljövariablerna valideras med Zod vid uppstart.
// Saknas eller är något fel kraschar servern direkt med ett tydligt fel (fail fast),
// istället för att fela senare på ett svårförståeligt sätt.
const envSchema = z.object({
  SUPABASE_URL: z.url(),
  // SÄKERHET: publishable-nyckeln följer databasens RLS-regler. Secret-nyckeln används aldrig.
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  // Allt i process.env är text – coerce gör om "3000" till talet 3000.
  PORT: z.coerce.number().default(3000),
});

export const env = envSchema.parse(process.env);
