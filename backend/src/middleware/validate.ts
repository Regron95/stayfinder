import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

// Middleware för att validera inkommande JSON-data mot ett Zod-schema.
export const validateJson = <T extends z.ZodType>(schema: T) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "Ogiltig data",
          fields: z.flattenError(result.error).fieldErrors,
        },
        400,
      );
    }
  });
