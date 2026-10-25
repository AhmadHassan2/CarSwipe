import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Heart, MessageCircle, Car, Flame, Settings } from "lucide-react";
import { auth } from "@/server/auth";
import { getProfile } from "@/server/services/account";
import { getRatingSummary } from "@/server/services/reviews";
import { UserAvatar } from "@/components/shared/user-avatar";
import { RatingSummaryInline } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import { BODY_STYLE_LABELS, SELLER_TYPE_LABELS } from "@/features/vehicles/constants";
import { formatDate, formatKm, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const userId = (await auth())?.user?.id;
  if (!userId) redirect("/login?callbackUrl=/profile");
  const [p, rating] = await Promise.all([getProfile(userId), getRatingSummary(userId)]);
  const prefs = p.preferences;

  const stats = [
    { label: "Saved cars", value: p._count.saved, href: "/saved", icon: Heart },
    { label: "Cars swiped", value: p._count.swipes, href: "/swipe", icon: Flame },
    { label: "Active listings", value: p._count.vehicles, href: "/dashboard", icon: Car },
    { label: "Conversations", value: p._count.buyerConvos + p._count.sellerConvos, href: "/messages", icon: MessageCircle },
  ];

  const prefRows: [string, string][] = [];
  if (prefs?.maxPrice || prefs?.minPrice) prefRows.push(["Budget", `${prefs.minPrice ? formatPrice(prefs.minPrice) : "$0"} – ${prefs.maxPrice ? formatPrice(prefs.maxPrice) : "no limit"}`]);
  if (prefs?.bodyStyles.length) prefRows.push(["Body styles", prefs.bodyStyles.map((b) => BODY_STYLE_LABELS[b]).join(", ")]);
  if (prefs?.preferredMakes.length) prefRows.push(["Brands", prefs.preferredMakes.join(", ")]);
  if (prefs?.minYear || prefs?.maxYear) prefRows.push(["Years", `${prefs.minYear ?? "any"} – ${prefs.maxYear ?? "any"}`]);
  if (prefs?.maxMileage) prefRows.push(["Mileage", `Up to ${formatKm(prefs.maxMileage)}`]);
  if (prefs?.location) prefRows.push(["Near", `${prefs.location}${prefs.radius ? ` (${prefs.radius} km)` : ""}`]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <section className="flex flex-col items-start gap-5 rounded-2xl border bg-card p-6 shadow-card sm:flex-row sm:items-center">
        <UserAvatar name={p.name} image={p.image} className="size-20 text-xl" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{p.name ?? "Your profile"}</h1>
          <p className="text-sm text-muted-foreground">{p.email}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">{p.sellerType === "DEALER" && <Building2 className="size-3.5" />}{p.dealerName ?? SELLER_TYPE_LABELS[p.sellerType]}</span>
            <span>Member since {formatDate(p.createdAt)}</span>
          </p>
          <div className="mt-2"><RatingSummaryInline average={rating.average} count={rating.count} className="text-sm" /></div>
        </div>
        <Button asChild variant="outline" className="rounded-full"><Link href="/settings"><Settings /> Edit profile</Link></Button>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border bg-card p-4 shadow-card transition-colors hover:border-foreground/20">
            <s.icon className="size-5 text-muted-foreground" />
            <p className="mt-2 text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </Link>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">What you’re looking for</h2>
            <p className="text-sm text-muted-foreground">These shape the order of cars in your swipe deck.</p>
          </div>
          <Button asChild variant="ghost" size="sm"><Link href="/settings#preferences">Edit</Link></Button>
        </div>
        {prefRows.length ? (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {prefRows.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="text-sm font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No preferences yet. <Link href="/settings#preferences" className="font-medium text-foreground underline underline-offset-4">Set them up</Link> to get better matches.</p>
        )}
      </section>
    </div>
  );
}
