import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Building2, Eye, MapPin } from "lucide-react";
import { auth } from "@/server/auth";
import { getRelatedVehicles, getVehicleDetail, recordView } from "@/server/services/vehicles";
import { Gallery } from "@/components/vehicles/gallery";
import { SaveButton } from "@/components/vehicles/save-button";
import { CompareButton } from "@/components/vehicles/compare-button";
import { ContactSeller } from "@/components/vehicles/contact-seller";
import { VehicleGrid } from "@/components/vehicles/vehicle-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { RatingSummaryInline } from "@/components/shared/star-rating";
import { SellerReviews } from "@/components/vehicles/seller-reviews";
import { getRatingSummary, getReviewEligibility, listReviews } from "@/server/services/reviews";
import {
  BODY_STYLE_LABELS, CONDITION_LABELS, DRIVETRAIN_LABELS, FUEL_TYPE_LABELS, SELLER_TYPE_LABELS, TRANSMISSION_LABELS,
} from "@/features/vehicles/constants";
import { formatDate, formatKm, formatPrice, timeAgo, vehicleTitle } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/vehicles/[id]">): Promise<Metadata> {
  const { id } = await params;
  const v = await getVehicleDetail(id);
  if (!v || v.status === "DRAFT" || v.status === "REMOVED") return { title: "Listing not found" };
  return {
    title: `${vehicleTitle(v)} — ${formatPrice(v.price)}`,
    description: `${formatKm(v.mileage)} · ${v.location}. ${(v.description ?? "").slice(0, 140)}`,
    openGraph: { images: v.images[0] ? [v.images[0].imageUrl] : undefined },
  };
}

export default async function VehiclePage({ params }: PageProps<"/vehicles/[id]">) {
  const { id } = await params;
  const [session, v] = await Promise.all([auth(), getVehicleDetail(id)]);
  const viewerId = session?.user?.id ?? null;
  if (!v) notFound();
  const isOwner = viewerId === v.sellerId;
  if ((v.status === "DRAFT" || v.status === "REMOVED") && !isOwner) notFound();
  if (!isOwner) await recordView(v.id, viewerId).catch(() => {});

  const [related, rating, reviews, eligibility] = await Promise.all([
    getRelatedVehicles(v),
    getRatingSummary(v.sellerId),
    listReviews(v.sellerId, 5),
    getReviewEligibility(viewerId, v.sellerId),
  ]);
  const title = vehicleTitle(v);
  const sellerName = v.seller.dealerName ?? v.seller.name ?? "Seller";
  const unavailable = v.status !== "ACTIVE";

  const specs: [string, string | number | null | undefined][] = [
    ["Year", v.year],
    ["Mileage", formatKm(v.mileage)],
    ["Body style", v.bodyStyle ? BODY_STYLE_LABELS[v.bodyStyle] : null],
    ["Transmission", v.transmission ? TRANSMISSION_LABELS[v.transmission] : null],
    ["Fuel type", v.fuelType ? FUEL_TYPE_LABELS[v.fuelType] : null],
    ["Drivetrain", v.drivetrain ? DRIVETRAIN_LABELS[v.drivetrain] : null],
    ["Engine", v.engine],
    ["Horsepower", v.horsepower ? `${v.horsepower} hp` : null],
    ["Exterior", v.exteriorColour],
    ["Interior", v.interiorColour],
    ["Previous owners", v.owners],
    ["Condition", CONDITION_LABELS[v.condition]],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <Link href="/browse" className="hover:text-foreground">Browse</Link> / <Link href={`/browse?makes=${encodeURIComponent(v.make)}`} className="hover:text-foreground">{v.make}</Link> / {v.model}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="min-w-0 space-y-8">
          <Gallery images={v.images} title={title} />

          <section>
            <h2 className="mb-3 text-xl font-semibold">Description</h2>
            <p className="whitespace-pre-line text-muted-foreground">{v.description || "The seller hasn't added a description yet."}</p>
            {v.history && <p className="mt-3 rounded-lg bg-muted p-3 text-sm"><span className="font-medium">History: </span>{v.history}</p>}
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Specifications</h2>
            <dl className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2">
              {specs.filter(([, val]) => val !== null && val !== undefined && val !== "").map(([label, val]) => (
                <div key={label} className="flex justify-between gap-4 bg-card px-4 py-3">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium">{val}</dd>
                </div>
              ))}
            </dl>
          </section>

          {v.features.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-semibold">Features</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {v.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm"><BadgeCheck className="size-4 shrink-0 text-muted-foreground" /> {f}</li>
                ))}
              </ul>
            </section>
          )}

          <SellerReviews
            sellerId={v.sellerId}
            sellerName={sellerName}
            summary={rating}
            reviews={reviews}
            canReview={eligibility.canReview}
            existing={eligibility.existing}
            signedIn={Boolean(viewerId)}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            {unavailable && (
              <p className="mb-3 inline-block rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
                {v.status === "SOLD" ? "Sold" : v.status === "PENDING" ? "Sale pending" : "Not published"}
              </p>
            )}
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {v.trim && <p className="text-muted-foreground">{v.trim}</p>}
            <p className="mt-3 text-3xl font-bold tracking-tight">{formatPrice(v.price)}</p>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-4" /> {v.location}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Eye className="size-3.5" /> Listed {v.publishedAt ? timeAgo(v.publishedAt) : formatDate(v.createdAt)} · {v._count.saved} saved
            </p>
            {v.isDemo && <p className="mt-3 rounded-lg bg-muted p-2.5 text-xs text-muted-foreground">Demo listing. Photos are representative stock images, not this exact vehicle.</p>}
            <div className="mt-4 flex gap-2">
              <SaveButton vehicleId={v.id} variant="outline" className="flex-1" />
              <CompareButton vehicleId={v.id} />
            </div>
            <div className="mt-4"><ContactSeller vehicleId={v.id} title={title} isOwner={isOwner} unavailable={unavailable} /></div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
            <UserAvatar name={sellerName} image={v.seller.image} className="size-11" />
            <div className="min-w-0">
              <p className="truncate font-medium">{sellerName}</p>
              <a href="#reviews-heading" className="block"><RatingSummaryInline average={rating.average} count={rating.count} /></a>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                {v.seller.sellerType === "DEALER" && <Building2 className="size-3.5" />}
                {SELLER_TYPE_LABELS[v.seller.sellerType]} · {v.seller._count.vehicles} active {v.seller._count.vehicles === 1 ? "listing" : "listings"}
              </p>
              <p className="text-xs text-muted-foreground">Member since {formatDate(v.seller.createdAt)}</p>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-xl font-semibold">Similar cars</h2>
          <VehicleGrid vehicles={related} />
        </section>
      )}
    </div>
  );
}
