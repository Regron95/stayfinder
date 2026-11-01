import type { z } from "zod";
import type { createBookingSchema } from "../validators/booking.js";

// G16: Samma mönster som Property – typen skapas från Zod-schemat.
// NewBooking = det klienten får skicka in.
export type NewBooking = z.infer<typeof createBookingSchema>;

// Booking = en bokning från databasen: allt i NewBooking + det databasen sätter själv.
export type Booking = NewBooking & {
  id: string;
  property_id: string;
  user_id: string;
  price_per_night: number; // VG6: från boendet, låst vid bokningstillfället
  total_price: number;     // VG6: räknas av triggern
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
};
