import { Suspense } from "react";
import PropertyDetails from "./PropertyDetails";

// Server Component (ingen "use client"): ett skal runt detaljsidan.
// Suspense visar fallback medan id:t från URL:en blir tillgängligt i webbläsaren.
export default function PropertyPage() {
  return (
    <Suspense fallback={<p className="p-8">Laddar boende...</p>}>
      <PropertyDetails />
    </Suspense>
  );
}
