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
