// Typdefinition för en fastighet
export type Property = {
  id: string;
  title: string;
  description: string;
  location: string;
  price_per_night: number;
  max_guests: number;
  created_at: string;
};

export type NewProperty = Omit<Property, "id" | "created_at">;