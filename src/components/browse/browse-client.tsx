"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterPanel } from "./filter-panel";
import {
  SORT_OPTIONS, countActiveFilters, filtersToSearchParams, parseFilters, type SortOption, type VehicleFilters,
} from "@/features/vehicles/filters";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

/** Filter + sort controls. All state lives in the URL so results are shareable and survive refresh. */
export function BrowseControls({ makes, total, children }: { makes: { make: string; count: number }[]; total: number; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [pending, startTransition] = useTransition();
  const filters = parseFilters(search);
  const [query, setQuery] = useState(filters.q ?? "");
  const debouncedQuery = useDebouncedValue(query, 350);

  const apply = useCallback(
    (patch: Partial<VehicleFilters>) => {
      const next = { ...parseFilters(new URLSearchParams(window.location.search)), ...patch, page: undefined };
      const qs = filtersToSearchParams(next as VehicleFilters).toString();
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
    },
    [router, pathname],
  );

  useEffect(() => {
    const current = new URLSearchParams(window.location.search).get("q") ?? "";
    if (debouncedQuery.trim() !== current) apply({ q: debouncedQuery.trim() || undefined });
  }, [debouncedQuery, apply]);

  const clear = () => {
    setQuery("");
    startTransition(() => router.replace(pathname, { scroll: false }));
  };
  const active = countActiveFilters(filters);

  const panel = <FilterPanel filters={filters} makes={makes} onChange={apply} onClear={clear} />;

  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border bg-card p-5 shadow-card">
          <p className="mb-4 flex items-center justify-between font-semibold">Filters {active > 0 && <span className="text-xs font-normal text-muted-foreground">{active} applied</span>}</p>
          {panel}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative min-w-52 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search make, model, city…" className="h-10 rounded-full pl-9" aria-label="Search listings" />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search" className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            )}
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="rounded-full lg:hidden">
                <SlidersHorizontal /> Filters{active > 0 && ` (${active})`}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(22rem,90vw)] overflow-y-auto p-5">
              <SheetHeader className="p-0 pb-4"><SheetTitle>Filters</SheetTitle></SheetHeader>
              {panel}
            </SheetContent>
          </Sheet>
          <Select value={filters.sort ?? "newest"} onValueChange={(v) => apply({ sort: v as SortOption })}>
            <SelectTrigger className="w-44 rounded-full" aria-label="Sort by"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(SORT_OPTIONS).map(([k, label]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
          {total.toLocaleString()} {total === 1 ? "car" : "cars"}{filters.q ? ` for “${filters.q}”` : ""}
        </p>
        <div className={cn("transition-opacity", pending && "opacity-60")}>{children}</div>
      </div>
    </div>
  );
}
