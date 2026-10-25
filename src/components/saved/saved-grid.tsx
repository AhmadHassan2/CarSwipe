"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useSavedStore } from "@/store/saved";
import { timeAgo } from "@/lib/format";
import type { VehicleCardData } from "@/server/services/vehicles";

/** Hides cards as soon as they're unsaved, without waiting for a server refresh. */
export function SavedGrid({ items, filtered }: { items: { createdAt: Date | string; vehicle: VehicleCardData }[]; filtered: boolean }) {
  const ids = useSavedStore((s) => s.ids);
  const hydrated = useSavedStore((s) => s.hydrated);
  const visible = hydrated ? items.filter((i) => ids.has(i.vehicle.id)) : items;

  if (!visible.length) {
    return filtered ? (
      <EmptyState icon={Heart} title="No saved cars match" description="Try a different search or body style." />
    ) : (
      <EmptyState
        icon={Heart}
        title="Your garage is empty"
        description="Swipe right on a car, or tap the heart on any listing, and it'll show up here."
        action={<Button asChild><Link href="/swipe">Start swiping</Link></Button>}
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {visible.map(({ vehicle, createdAt }, i) => (
        <div key={vehicle.id} className="space-y-1.5">
          <VehicleCard vehicle={vehicle} priority={i < 4} />
          <p className="px-1 text-xs text-muted-foreground">Saved {timeAgo(createdAt)}</p>
        </div>
      ))}
    </div>
  );
}
