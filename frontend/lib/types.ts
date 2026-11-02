// G16: Samma form som backendens typer. Frontend och backend är separata projekt,
// så typen skrivs här igen – den beskriver JSON:en som API:t skickar.
export type Property = {
  id: string;
  title: string;
  description: string;
  location: string;
  price_per_night: number;
  max_guests: number;
  owner_id: string | null;
  created_at: string;
};

// G2: Det backenden skickar från /auth/login, /auth/register och /auth/me.
// Bara id och e-post – backenden skickar inte hela användarobjektet.
export type User = {
  id: string;
  email: string;
};

// Union type: bara dessa tre värden finns (samma som check-constrainten i databasen)
export type BookingStatus = "pending" | "confirmed" | "cancelled";

// En bokning som API:t skickar. Pris och status sätts av databasen (VG6).
export type Booking = {
  id: string;
  property_id: string;
  user_id: string;
  guest_name: string;
  guest_email: string;
  guests: number;
  check_in: string; // "2026-12-24"
  check_out: string;
  price_per_night: number;
  total_price: number;
  status: BookingStatus;
  created_at: string;
};
