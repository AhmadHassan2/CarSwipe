import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Car, Plus } from "lucide-react";
import { auth } from "@/server/auth";
import { getViewsSeries, listOwnListings } from "@/server/services/listings";
import { getRatingSummary } from "@/server/services/reviews";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { RatingSummaryInline } from "@/components/shared/star-rating";
import { ViewsChart } from "@/components/dashboard/views-chart";
import { ListingActions } from "@/components/dashboard/listing-actions";
import { VehicleImage } from "@/components/vehicles/vehicle-image";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS } from "@/features/vehicles/constants";
import { formatNumber, formatPrice, timeAgo, vehicleTitle } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Seller dashboard" };

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-primary/10 text-primary",
  DRAFT: "bg-muted text-muted-foreground",
  PENDING: "bg-muted text-foreground",
  SOLD: "bg-foreground text-background",
};

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const userId = (await auth())?.user?.id;
  if (!userId) redirect("/login?callbackUrl=/dashboard");
  const [listings, series, rating] = await Promise.all([listOwnListings(userId), getViewsSeries(userId, 14), getRatingSummary(userId)]);

  const active = listings.filter((l) => l.status === "ACTIVE").length;
  const totals = listings.reduce((a, l) => ({ views: a.views + l._count.views, saves: a.saves + l._count.saved, inquiries: a.inquiries + l._count.conversations }), { views: 0, saves: 0, inquiries: 0 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Seller dashboard"
        description={<RatingSummaryInline average={rating.average} count={rating.count} className="text-sm" />}
        actions={<Button asChild variant="brand" className="rounded-full"><Link href="/sell"><Plus /> New listing</Link></Button>}
      />

      {listings.length === 0 ? (
        <EmptyState icon={Car} title="You haven't listed a car yet" description="It takes about five minutes. Buyers who match your car will see it in their swipe deck." action={<Button asChild variant="brand"><Link href="/sell">List your car</Link></Button>} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Active listings" value={formatNumber(active)} hint={`${listings.length} total`} />
            <Stat label="Views" value={formatNumber(totals.views)} hint="All time" />
            <Stat label="Saves" value={formatNumber(totals.saves)} hint="Buyers who saved your cars" />
            <Stat label="Inquiries" value={formatNumber(totals.inquiries)} hint="Conversations started" />
          </div>

          <div className="mt-6"><ViewsChart data={series} /></div>

          <section className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-card" aria-labelledby="listings-title">
            <h2 id="listings-title" className="border-b px-5 py-4 font-semibold">Your listings</h2>
            <ul className="divide-y">
              {listings.map((l) => {
                const title = vehicleTitle(l);
                return (
                  <li key={l.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:block">
                      <VehicleImage src={l.images[0]?.imageUrl} alt="" sizes="96px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={l.status === "DRAFT" ? `/sell/${l.id}/edit` : `/vehicles/${l.id}`} className="truncate font-medium hover:underline">{title}</Link>
                        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS_STYLE[l.status])}>{STATUS_LABELS[l.status]}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatPrice(l.price)}{l.trim ? ` · ${l.trim}` : ""}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                        {l._count.views} views · {l._count.saved} saves · {l._count.conversations} inquiries · updated {timeAgo(l.updatedAt)}
                      </p>
                    </div>
                    <ListingActions id={l.id} title={title} status={l.status as "DRAFT" | "ACTIVE" | "PENDING" | "SOLD"} />
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
