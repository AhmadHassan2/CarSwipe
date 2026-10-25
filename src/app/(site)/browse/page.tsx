import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { BrowseControls } from "@/components/browse/browse-client";
import { VehicleGrid } from "@/components/vehicles/vehicle-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { parseFilters } from "@/features/vehicles/filters";
import { getMakeOptions, listVehicles } from "@/server/services/vehicles";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Browse cars", description: "Search and filter cars for sale near you." };

export default async function BrowsePage({ searchParams }: PageProps<"/browse">) {
  const filters = parseFilters(await searchParams);
  const [{ items, total, page, pageCount }, makes] = await Promise.all([listVehicles(filters), getMakeOptions()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">Browse cars</h1>
      <Suspense>
        <BrowseControls makes={makes} total={total}>
          {items.length ? (
            <>
              <VehicleGrid vehicles={items} className="lg:grid-cols-2 xl:grid-cols-3" />
              <Pagination page={page} pageCount={pageCount} filters={filters} basePath="/browse" />
            </>
          ) : (
            <EmptyState icon={SearchX} title="No cars match those filters" description="Try widening your price range or clearing a filter or two." />
          )}
        </BrowseControls>
      </Suspense>
    </div>
  );
}
