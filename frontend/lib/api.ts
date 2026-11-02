// Adressen till backenden, från .env.local.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// Ett fel från API:t: statuskod, meddelande och ev. fel per fält (från validate i backenden).
export class ApiError extends Error {
  status: number;
  fields?: Record<string, string[]>;

  constructor(status: number, message: string, fields?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

// Alla anrop till API:t går via den här funktionen.
// <T> = vilken typ svaret har, t.ex. api<Property[]>("/properties"). (G16)
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    // Skickar med inloggningscookien – annars vet backenden inte vem vi är.
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await res.json();

  // fetch kastar INTE vid 400/401/404 – vi kastar själva så att sidan kan visa felet.
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? "Något gick fel", data.fields);
  }
  return data as T;
}
