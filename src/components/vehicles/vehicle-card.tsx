import Link from "next/link";
import { Gauge, MapPin, Settings2 } from "lucide-react";
import { VehicleImage } from "./vehicle-image";
import { SaveButton } from "./save-button";
import { ListingBadges } from "./vehicle-badges";
import { formatKm, formatPrice, vehicleTitle } from "@/lib/format";
import { TRANSMISSION_LABELS } from "@/features/vehicles/constants";
import type { VehicleCardData } from "@/server/services/vehicles";
import { cn } from "@/lib/utils";

type CardVehicle = Pick<
  VehicleCardData,
  "id" | "year" | "make" | "model" | "trim" | "price" | "mileage" | "location" | "transmission" | "condition" | "status" | "publishedAt" | "images" | "seller"
>;

export function VehicleCard({ vehicle, priority, className }: { vehicle: CardVehicle; priority?: boolean; className?: string }) {
  const title = vehicleTitle(vehicle);
  const unavailable = vehicle.status === "SOLD" || vehicle.status === "PENDING";
  return (
    <article className={cn("group relative overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-float", className)}>
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <VehicleImage
          src={vehicle.images[0]?.imageUrl}
          alt={vehicle.images[0]?.alt ?? title}
          sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <ListingBadges publishedAt={vehicle.publishedAt} condition={vehicle.condition} sellerType={vehicle.seller.sellerType} className="absolute top-3 left-3" />
        {unavailable && (
          <span className="absolute bottom-3 left-3 rounded-full bg-zinc-900/85 px-2.5 py-1 text-xs font-semibold text-white">
            {vehicle.status === "SOLD" ? "Sold" : "Sale pending"}
          </span>
        )}
        <SaveButton vehicleId={vehicle.id} className="absolute top-3 right-3 z-10" />
      </div>
      <div className="space-y-2 p-4">
        <div>
          <h3 className="truncate font-semibold">
            <Link href={`/vehicles/${vehicle.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
              {title}
            </Link>
          </h3>
          {vehicle.trim && <p className="truncate text-sm text-muted-foreground">{vehicle.trim}</p>}
        </div>
        <p className="text-xl font-bold tracking-tight">{formatPrice(vehicle.price)}</p>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-1"><Gauge className="size-3.5" /> {formatKm(vehicle.mileage)}</li>
          {vehicle.transmission && <li className="flex items-center gap-1"><Settings2 className="size-3.5" /> {TRANSMISSION_LABELS[vehicle.transmission]}</li>}
          <li className="flex items-center gap-1"><MapPin className="size-3.5" /> {vehicle.location}</li>
        </ul>
      </div>
    </article>
  );
}

export function VehicleGrid({ vehicles, className }: { vehicles: CardVehicle[]; className?: string }) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {vehicles.map((v, i) => (
        <VehicleCard key={v.id} vehicle={v} priority={i < 4} />
      ))}
    </div>
  );
}
