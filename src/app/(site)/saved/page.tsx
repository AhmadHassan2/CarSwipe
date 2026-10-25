import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Scale } from "lucide-react";
import { auth } from "@/server/auth";
import { listSaved, SAVED_SORTS, type SavedSort } from "@/server/services/saved";
import { getRecentlyViewed } from "@/server/services/vehicles";
import { PageHeader } from "@/components/shared/page-header";
import { SavedGrid } from "@/components/saved/saved-grid";
import { SavedToolbar } from "@/components/saved/saved-toolbar";
import { VehicleGrid } from "@/components/vehicles/vehicle-card";
import { Button } from "@/components/ui/button";
import { BODY_STYLES } from "@/features/vehicles/constants";

export const metadata: Metadata = { title: "My Garage" };

export default async function SavedPage({ searchParams }: PageProps<"/saved">) {
  const userId = (await auth())?.user?.id;
  if (!userId) redirect("/login?callbackUrl=/saved");
  const sp = await searchParams;
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 80) : undefined);
  const sort = str(sp.sort) && str(sp.sort)! in SAVED_SORTS ? (str(sp.sort) as SavedSort) : undefined;
  const bodyStyle = BODY_STYLES.find((b) => b === sp.bodyStyle);
  const q = str(sp.q);

  const [items, recent] = await Promise.all([listSaved(userId, { sort, q, bodyStyle }), getRecentlyViewed(userId, 4)]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader
        title="My Garage"
        description={`${items.length} saved ${items.length === 1 ? "car" : "cars"}`}
        actions={<Button asChild variant="outline" className="rounded-full"><Link href="/compare"><Scale /> Compare</Link></Button>}
      />
      <Suspense><SavedToolbar /></Suspense>
      <SavedGrid items={items} filtered={Boolean(q || bodyStyle)} />

      {recent.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-xl font-semibold">Recently viewed</h2>
          <VehicleGrid vehicles={recent} />
        </section>
      )}
    </div>
  );
}
