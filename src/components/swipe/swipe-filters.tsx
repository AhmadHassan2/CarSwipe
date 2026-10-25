"use client";

import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FilterPanel } from "@/components/browse/filter-panel";
import { countActiveFilters, filtersToSearchParams, type VehicleFilters } from "@/features/vehicles/filters";

export function SwipeFilters({ filters, makes }: { filters: VehicleFilters; makes: { make: string; count: number }[] }) {
  const router = useRouter();
  const go = (next: VehicleFilters) => {
    const qs = filtersToSearchParams(next).toString();
    router.replace(qs ? `/swipe?${qs}` : "/swipe", { scroll: false });
  };
  const active = countActiveFilters(filters);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-full"><SlidersHorizontal /> Filters{active > 0 && ` (${active})`}</Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(22rem,90vw)] overflow-y-auto p-5">
        <SheetHeader className="p-0 pb-4"><SheetTitle>Swipe filters</SheetTitle></SheetHeader>
        <FilterPanel filters={filters} makes={makes} onChange={(patch) => go({ ...filters, ...patch })} onClear={() => go({})} />
      </SheetContent>
    </Sheet>
  );
}
