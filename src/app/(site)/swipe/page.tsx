import type { Metadata } from "next";
import { auth } from "@/server/auth";
import { getRankedVehicles } from "@/server/services/recommendations";
import { SwipeDeck } from "@/components/swipe/swipe-deck";
import { SwipeFilters } from "@/components/swipe/swipe-filters";
import { filtersToSearchParams, parseFilters } from "@/features/vehicles/filters";
import { getMakeOptions } from "@/server/services/vehicles";

export const metadata: Metadata = { title: "Swipe", description: "Swipe through cars picked for you." };

export default async function SwipePage({ searchParams }: PageProps<"/swipe">) {
  const [session, sp] = await Promise.all([auth(), searchParams]);
  const filters = parseFilters(sp);
  const [vehicles, makes] = await Promise.all([
    getRankedVehicles({ userId: session?.user?.id ?? null, filters, limit: 10 }),
    getMakeOptions(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto mb-5 flex max-w-md items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Swipe</h1>
        <SwipeFilters filters={filters} makes={makes} />
      </div>
      <SwipeDeck key={filtersToSearchParams(filters).toString()} initial={JSON.parse(JSON.stringify(vehicles))} queryString={filtersToSearchParams(filters).toString()} />
    </div>
  );
}
