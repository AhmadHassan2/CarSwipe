"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Scale, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { VehicleImage } from "@/components/vehicles/vehicle-image";
import { SaveButton } from "@/components/vehicles/save-button";
import { useCompareStore } from "@/store/compare";
import { useMounted } from "@/hooks/use-mounted";
import { api } from "@/lib/fetcher";
import { formatKm, formatPrice, vehicleTitle } from "@/lib/format";
import {
  BODY_STYLE_LABELS, CONDITION_LABELS, DRIVETRAIN_LABELS, FUEL_TYPE_LABELS, SELLER_TYPE_LABELS, TRANSMISSION_LABELS,
} from "@/features/vehicles/constants";
import type { CompareVehicle } from "@/server/services/vehicles";
import { cn } from "@/lib/utils";

type Row = { label: string; value: (v: CompareVehicle) => string | number | null | undefined; best?: "min" | "max"; numeric?: (v: CompareVehicle) => number | null };

const ROWS: Row[] = [
  { label: "Price", value: (v) => formatPrice(v.price), best: "min", numeric: (v) => v.price },
  { label: "Year", value: (v) => v.year, best: "max", numeric: (v) => v.year },
  { label: "Mileage", value: (v) => formatKm(v.mileage), best: "min", numeric: (v) => v.mileage },
  { label: "Horsepower", value: (v) => (v.horsepower ? `${v.horsepower} hp` : null), best: "max", numeric: (v) => v.horsepower },
  { label: "Engine", value: (v) => v.engine },
  { label: "Body style", value: (v) => (v.bodyStyle ? BODY_STYLE_LABELS[v.bodyStyle] : null) },
  { label: "Transmission", value: (v) => (v.transmission ? TRANSMISSION_LABELS[v.transmission] : null) },
  { label: "Drivetrain", value: (v) => (v.drivetrain ? DRIVETRAIN_LABELS[v.drivetrain] : null) },
  { label: "Fuel", value: (v) => (v.fuelType ? FUEL_TYPE_LABELS[v.fuelType] : null) },
  { label: "Colour", value: (v) => v.exteriorColour },
  { label: "Owners", value: (v) => v.owners, best: "min", numeric: (v) => v.owners },
  { label: "Condition", value: (v) => CONDITION_LABELS[v.condition] },
  { label: "Seller", value: (v) => SELLER_TYPE_LABELS[v.seller.sellerType] },
  { label: "Location", value: (v) => v.location },
];

function bestIds(row: Row, vehicles: CompareVehicle[]) {
  if (!row.best || !row.numeric || vehicles.length < 2) return new Set<string>();
  const vals = vehicles.map((v) => ({ id: v.id, n: row.numeric!(v) })).filter((x): x is { id: string; n: number } => x.n != null);
  if (vals.length < 2) return new Set<string>();
  const target = row.best === "min" ? Math.min(...vals.map((x) => x.n)) : Math.max(...vals.map((x) => x.n));
  if (vals.every((x) => x.n === target)) return new Set<string>();
  return new Set(vals.filter((x) => x.n === target).map((x) => x.id));
}

export function CompareView() {
  const mounted = useMounted();
  const ids = useCompareStore((s) => s.ids);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const { data, isLoading } = useQuery({
    queryKey: ["compare", ids],
    queryFn: () => api<{ vehicles: CompareVehicle[] }>(`/api/vehicles?view=compare&ids=${ids.join(",")}`),
    enabled: mounted && ids.length > 0,
  });

  if (!mounted || (ids.length > 0 && isLoading)) {
    return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: Math.max(2, ids.length) }, (_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}</div>;
  }

  const vehicles = (data?.vehicles ?? []).filter((v) => ids.includes(v.id));
  if (!vehicles.length) {
    return (
      <EmptyState
        icon={Scale}
        title="Nothing to compare yet"
        description="Tap Compare on up to four listings to see them side by side."
        action={<div className="flex gap-2"><Button asChild><Link href="/saved">Pick from My Garage</Link></Button><Button asChild variant="outline"><Link href="/browse">Browse cars</Link></Button></div>}
      />
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{vehicles.length} of 4 cars{vehicles.length === 1 && " · add another to compare"}</p>
        <Button variant="ghost" size="sm" onClick={clear}>Clear all</Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">Vehicle comparison</caption>
          <thead>
            <tr>
              <th scope="col" className="w-36 p-4 text-left align-bottom font-medium text-muted-foreground">Vehicle</th>
              {vehicles.map((v) => (
                <th key={v.id} scope="col" className="min-w-48 p-4 text-left align-top font-normal">
                  <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                    <VehicleImage src={v.images[0]?.imageUrl} alt={vehicleTitle(v)} sizes="240px" />
                    <button onClick={() => remove(v.id)} aria-label={`Remove ${vehicleTitle(v)} from compare`} className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-card hover:bg-white">
                      <X className="size-4" />
                    </button>
                    <SaveButton vehicleId={v.id} className="absolute top-2 left-2 size-8" />
                  </div>
                  <Link href={`/vehicles/${v.id}`} className="font-semibold hover:underline">{vehicleTitle(v)}</Link>
                  {v.trim && <p className="text-muted-foreground">{v.trim}</p>}
                  {v.status !== "ACTIVE" && <p className="mt-1 text-xs font-medium">{v.status === "SOLD" ? "Sold" : "Sale pending"}</p>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const best = bestIds(row, vehicles);
              return (
                <tr key={row.label} className="border-t">
                  <th scope="row" className="p-4 text-left font-medium text-muted-foreground">{row.label}</th>
                  {vehicles.map((v) => (
                    <td key={v.id} className={cn("p-4", best.has(v.id) && "font-semibold")}>
                      {row.value(v) ?? <span className="text-muted-foreground">—</span>}
                      {best.has(v.id) && <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Best</span>}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
