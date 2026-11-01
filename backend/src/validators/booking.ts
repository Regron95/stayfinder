import { z } from "zod";

// G10: Regler för en bokning. Pris, status och user_id finns INTE här –
// okända fält tas bort, så klienten kan aldrig sätta dem själv. (VG1, VG6)
const bookingFields = z.object({
  guest_name: z.string().trim().min(2, "Namnet måste vara minst 2 tecken"),
  guest_email: z.email("Ogiltig e-postadress"),
  guests: z
    .number("Antal gäster måste vara ett tal")
    .int("Antal gäster måste vara ett heltal")
    .min(1, "Minst 1 gäst"),
  // z.iso.date = text på formen "2026-12-24"
  check_in: z.iso.date("Incheckning måste vara ett datum, t.ex. 2026-12-24"),
  check_out: z.iso.date("Utcheckning måste vara ett datum, t.ex. 2026-12-24"),
});

// POST: utcheckning måste vara efter incheckning.
// ISO-datum kan jämföras som text: "2026-12-24" < "2026-12-26".
// path: felet hamnar på check_out → frontenden kan visa det vid rätt fält.
export const createBookingSchema = bookingFields.refine(
  (b) => b.check_out > b.check_in,
  { message: "Utcheckning måste vara efter incheckning", path: ["check_out"] },
);

// PATCH: alla fält valfria. Enda tillåtna statusändringen är att avboka.
// Skickas bara ETT datum jämför databasen mot det andra (check_out_after_check_in).
export const updateBookingSchema = bookingFields
  .extend({ status: z.literal("cancelled", "Status kan bara ändras till cancelled") })
  .partial()
  .refine((b) => Object.keys(b).length > 0, {
    message: "Minst ett fält måste anges",
  })
  .refine((b) => !b.check_in || !b.check_out || b.check_out > b.check_in, {
    message: "Utcheckning måste vara efter incheckning",
    path: ["check_out"],
  });
