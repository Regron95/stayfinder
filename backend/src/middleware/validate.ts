import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

// Validerar inkommande data mot ett Zod-schema innan route-handlern körs. (G10, G14)
// target = vad som valideras: "json" (body), "param" (t.ex. :id) eller "query" (filter i URL:en).
// Generics (<Target, T>) gör att c.req.valid(...) i handlern får rätt typ från schemat. (G16)
export const validate = <
  Target extends "json" | "param" | "query",
  T extends z.ZodType,
>(
  target: Target,
  schema: T,
) =>
  zValidator(target, schema, (result, c) => {
    // Ogiltig data → 400. Handlern körs aldrig.
    if (!result.success) {
      // formErrors = fel för hela objektet (t.ex. tom PATCH), fieldErrors = fel per fält,
      // så att frontenden kan visa felet vid rätt fält i formuläret.
      const { formErrors, fieldErrors } = z.flattenError(result.error);
      return c.json(
        { error: formErrors[0] ?? "Ogiltig data", fields: fieldErrors },
        400,
      );
    }
  });
