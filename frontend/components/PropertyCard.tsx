import Image from "next/image";
import Link from "next/link";
import { propertyImage } from "@/lib/images";
import type { Property } from "@/lib/types";

// Ett kort i listan på startsidan: bild, titel, plats och pris. Hela kortet är en länk.
export default function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/properties/${property.id}`}
      className="card block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      {/* next/image: laddar bilden lazy och i rätt storlek. alt = text för skärmläsare. */}
      <Image src={propertyImage(property.id)} alt={property.title} width={600} height={400}
        className="h-48 w-full object-cover" />
      <div className="p-4">
        <h2 className="text-lg font-semibold">{property.title}</h2>
        <p className="text-gray-600">{property.location}</p>
        <p className="mt-2">
          <span className="font-semibold">{property.price_per_night} kr</span> / natt · max {property.max_guests} gäster
        </p>
      </div>
    </Link>
  );
}
