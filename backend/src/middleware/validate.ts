import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

//För att validera inkommande data med Zod-scheman. Om valideringen misslyckas returneras ett JSON-svar med felmeddelanden.
export const validate = <
Target extends "json" | "param" | "query",
T extends z.ZodType,
>( 
  target: Target,
  schema: T,
) => 
 zValidator(target, schema, (result, c) => {
  if (!result.success) {
      const { formErrors, fieldErrors } = z.flattenError(result.error);
      return c.json(
        { error: formErrors[0] ?? "Ogiltig data", fields: fieldErrors },
        400,
      );
    }
  });
