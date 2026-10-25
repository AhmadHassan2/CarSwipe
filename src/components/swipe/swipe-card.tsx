"use client";

import Link from "next/link";
import { animate, motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { Gauge, MapPin, Settings2 } from "lucide-react";
import { VehicleImage } from "@/components/vehicles/vehicle-image";
import { ListingBadges } from "@/components/vehicles/vehicle-badges";
import { formatKm, formatPrice, vehicleTitle } from "@/lib/format";
import { TRANSMISSION_LABELS } from "@/features/vehicles/constants";
import type { VehicleCardData } from "@/server/services/vehicles";
import { cn } from "@/lib/utils";

const THRESHOLD = 110;

export type SwipeVehicle = Omit<VehicleCardData, "publishedAt" | "createdAt"> & { publishedAt: string | Date | null; createdAt: string | Date };

export function SwipeCard({
  vehicle,
  active,
  depth,
  onSwipe,
}: {
  vehicle: SwipeVehicle;
  active: boolean;
  depth: number;
  onSwipe: (direction: "LIKE" | "PASS") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-14, 14]);
  const likeOpacity = useTransform(x, [20, THRESHOLD], [0, 1]);
  const passOpacity = useTransform(x, [-THRESHOLD, -20], [1, 0]);
  const title = vehicleTitle(vehicle);

  const fling = (direction: "LIKE" | "PASS") => {
    onSwipe(direction);
    animate(x, direction === "LIKE" ? 600 : -600, { duration: 0.22 });
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > THRESHOLD || info.velocity.x > 600) fling("LIKE");
    else if (info.offset.x < -THRESHOLD || info.velocity.x < -600) fling("PASS");
    else animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
  };

  return (
    <motion.div
      data-swipe-card={vehicle.id}
      className={cn("absolute inset-0 touch-pan-y select-none", active ? "cursor-grab active:cursor-grabbing" : "pointer-events-none")}
      style={active ? { x, rotate } : undefined}
      animate={active ? undefined : { scale: 1 - depth * 0.04, y: depth * 12 }}
      initial={false}
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={active ? onDragEnd : undefined}
      aria-hidden={!active}
    >
      <article className="relative h-full overflow-hidden rounded-3xl border bg-card shadow-float">
        <VehicleImage src={vehicle.images[0]?.imageUrl} alt={vehicle.images[0]?.alt ?? title} sizes="(min-width: 640px) 440px, 100vw" priority={active} />
        <ListingBadges publishedAt={vehicle.publishedAt} condition={vehicle.condition} sellerType={vehicle.seller.sellerType} className="absolute top-4 left-4" />

        {active && (
          <>
            <motion.span style={{ opacity: likeOpacity }} className="absolute top-8 left-6 -rotate-12 rounded-lg border-[3px] border-white px-3 py-1 text-2xl font-extrabold tracking-wider text-white">LIKE</motion.span>
            <motion.span style={{ opacity: passOpacity }} className="absolute top-8 right-6 rotate-12 rounded-lg border-[3px] border-white px-3 py-1 text-2xl font-extrabold tracking-wider text-white">PASS</motion.span>
          </>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-5 pt-28 text-white">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold">{title}</h2>
              {vehicle.trim && <p className="truncate text-sm text-white/75">{vehicle.trim}</p>}
            </div>
            <p className="text-2xl font-bold">{formatPrice(vehicle.price)}</p>
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/85">
            <li className="flex items-center gap-1.5"><Gauge className="size-4" /> {formatKm(vehicle.mileage)}</li>
            {vehicle.transmission && <li className="flex items-center gap-1.5"><Settings2 className="size-4" /> {TRANSMISSION_LABELS[vehicle.transmission]}</li>}
            <li className="flex items-center gap-1.5"><MapPin className="size-4" /> {vehicle.location}</li>
          </ul>
          {active && (
            <Link
              href={`/vehicles/${vehicle.id}`}
              onPointerDownCapture={(e) => e.stopPropagation()}
              className="mt-3 inline-block text-sm font-medium text-white underline underline-offset-4"
            >
              View full details
            </Link>
          )}
        </div>
      </article>
    </motion.div>
  );
}
