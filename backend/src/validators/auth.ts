import { z } from "zod";

export const authSchema = z.object({
  email: z.email("Ogiltig e-postadress"),
  password: z.string().min(6, "Lösenordet måste vara minst 6 tecken"),
});