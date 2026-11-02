import type { BookingStatus } from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;

// G11: Antal nätter mellan två datum på formen "2026-12-24".
// Date.parse tolkar "YYYY-MM-DD" som UTC, så sommartid påverkar inte uträkningen.
// Saknas ett datum, eller är utcheckning inte efter incheckning → 0.
export function countNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const diff = Date.parse(checkOut) - Date.parse(checkIn);
  return diff > 0 ? diff / DAY_MS : 0;
}

// Dagens datum som "YYYY-MM-DD" – används som min på datumfälten
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Record<BookingStatus, string> = TS kräver en text för VARJE status
export const statusLabel: Record<BookingStatus, string> = {
  pending: "Väntar",
  confirmed: "Bekräftad",
  cancelled: "Avbokad",
};
