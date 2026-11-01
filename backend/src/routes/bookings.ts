import { Hono, type Context } from "hono";
import type { PostgrestError } from "@supabase/supabase-js";
import type { AppEnv } from "../lib/supabase.js";
import type { Booking } from "../types/booking.js";
import { requireAuth } from "../middleware/auth.js";
import { requireBookingOwner } from "../middleware/ownership.js";
import { validate } from "../middleware/validate.js";
import { idParamSchema } from "../validators/property.js";
import {
  createBookingSchema,
  updateBookingSchema,
} from "../validators/booking.js";

const bookingsApp = new Hono<AppEnv>();

// Reglerna ligger i databasen (G15). Här översätts databasens fel till tydliga svar.
const bookingError = (c: Context<AppEnv>, error: PostgrestError) => {
  // VG2: exclusion constraint no_overlapping_bookings → 409 Conflict
  if (error.code === "23P01") {
    return c.json({ error: "Boendet är redan bokat dessa datum" }, 409);
  }
  // Våra egna triggerfel (raise exception), t.ex. VG3. Texten skrev vi själva → säker att visa.
  if (error.code === "P0001") {
    return c.json({ error: error.message }, 400);
  }
  // check constraint, t.ex. utcheckning före incheckning vid PATCH
  if (error.code === "23514") {
    return c.json({ error: "Ogiltig bokning" }, 400);
  }
  // Okänt fel → onError → 500 (detaljerna loggas bara på servern)
  throw new Error(error.message);
};

// VG1: Mina bokningar – de jag själv har gjort.
bookingsApp.get("/bookings", requireAuth, async (c) => {
  const { data, error } = await c.var.supabase
    .from("bookings")
    .select("*")
    .eq("user_id", c.var.user.id)
    .order("check_in");

  if (error) throw new Error(error.message);
  return c.json(data as Booking[]);
});

// G12/VG1: Bokningar för ett boende. RLS avgör vad man ser:
// gästen ser sina egna, ägaren av boendet ser alla.
bookingsApp.get(
  "/properties/:id/bookings",
  requireAuth,
  validate("param", idParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { data, error } = await c.var.supabase
      .from("bookings")
      .select("*")
      .eq("property_id", id)
      .order("check_in");

    if (error) throw new Error(error.message);
    return c.json(data as Booking[]);
  },
);

// G9: Boka ett boende. Utloggad → 401.
bookingsApp.post(
  "/properties/:id/bookings",
  requireAuth,
  validate("param", idParamSchema),
  validate("json", createBookingSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");

    // Hämtar boendet: 404 om det inte finns + max_guests från DATABASEN, inte klienten (VG3)
    const { data: property, error: propertyError } = await c.var.supabase
      .from("properties")
      .select("max_guests")
      .eq("id", id)
      .maybeSingle();

    if (propertyError) throw new Error(propertyError.message);
    if (!property) return c.json({ error: "Property not found" }, 404);

    // VG3 i API:t: tydligt fel vid rätt fält. Triggern kollar samma sak i databasen.
    if (body.guests > property.max_guests) {
      const message = `Max ${property.max_guests} gäster för detta boende`;
      return c.json({ error: message, fields: { guests: [message] } }, 400);
    }

    // property_id kommer från URL:en. user_id, pris och status sätter databasen (VG1, VG6).
    const { data, error } = await c.var.supabase
      .from("bookings")
      .insert({ ...body, property_id: id })
      .select()
      .single();

    if (error) return bookingError(c, error);
    return c.json(data as Booking, 201);
  },
);

// G12: Ändra eller avboka sin egen bokning.
bookingsApp.patch(
  "/bookings/:id",
  requireAuth,
  validate("param", idParamSchema),
  requireBookingOwner,
  validate("json", updateBookingSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const { data, error } = await c.var.supabase
      .from("bookings")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) return bookingError(c, error);
    return c.json(data as Booking);
  },
);

// G12: Ta bort sin egen bokning.
bookingsApp.delete(
  "/bookings/:id",
  requireAuth,
  validate("param", idParamSchema),
  requireBookingOwner,
  async (c) => {
    const { id } = c.req.valid("param");
    const { error } = await c.var.supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    return c.json({ message: "Booking deleted" });
  },
);

export default bookingsApp;
