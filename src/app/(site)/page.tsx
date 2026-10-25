import Link from "next/link";
import { ArrowRight, Heart, MessageCircle, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehicleGrid } from "@/components/vehicles/vehicle-card";
import { HeroSwipeDemo } from "@/components/landing/hero-swipe-demo";
import { getFeaturedVehicles } from "@/server/services/vehicles";
import { BODY_STYLE_LABELS } from "@/features/vehicles/constants";
import { formatKm, formatPrice, vehicleTitle } from "@/lib/format";

const STEPS = [
  { icon: Heart, title: "Swipe to save", body: "Swipe right on cars you like and left on the ones you don't. Every like lands in your garage." },
  { icon: Scale, title: "Compare side by side", body: "Line up to four cars and see price, mileage and specs together." },
  { icon: MessageCircle, title: "Talk to the seller", body: "Message dealers and private sellers directly, without sharing your number." },
];

const BODY_SHORTCUTS = ["SUV", "SEDAN", "COUPE", "TRUCK", "HATCHBACK", "WAGON"] as const;

export default async function HomePage() {
  const featured = await getFeaturedVehicles(8);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Find your next ride, <span className="text-muted-foreground">one swipe at a time.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Skip the endless scrolling. CarSwipe learns what you like and shows you cars that fit your budget, style and commute.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="brand" className="h-12 rounded-full px-6 text-base">
                <Link href="/swipe">Start swiping <ArrowRight /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6 text-base">
                <Link href="/browse">Browse all cars</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {BODY_SHORTCUTS.map((b) => (
                <Link key={b} href={`/browse?bodyStyles=${b}`} className="rounded-full border bg-surface px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
                  {BODY_STYLE_LABELS[b]}
                </Link>
              ))}
            </div>
          </div>

          <HeroSwipeDemo
            cars={featured.slice(0, 8).map((v) => ({
              id: v.id,
              title: vehicleTitle(v),
              trim: v.trim,
              price: formatPrice(v.price),
              km: formatKm(v.mileage),
              image: v.images[0]?.imageUrl ?? null,
            }))}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How CarSwipe works</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-foreground"><s.icon className="size-5" /></span>
                <span className="text-sm font-semibold text-muted-foreground">Step {i + 1}</span>
              </div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Popular right now</h2>
              <p className="mt-1 text-muted-foreground">The most-saved cars on CarSwipe this week.</p>
            </div>
            <Button asChild variant="ghost" className="rounded-full text-foreground">
              <Link href="/browse">See all <ArrowRight /></Link>
            </Button>
          </div>
          <VehicleGrid vehicles={featured} />
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex flex-col items-start gap-6 overflow-hidden rounded-3xl bg-brand-gradient p-8 text-white sm:p-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Selling a car?</h2>
            <p className="mt-2 max-w-md text-white/85">List it in minutes and put it in front of buyers who are already swiping for something like it.</p>
          </div>
          <Button asChild size="lg" className="h-12 rounded-full bg-white px-6 text-base text-[#1c1c1f] hover:bg-white/90">
            <Link href="/sell">List your car <ArrowRight /></Link>
          </Button>
        </div>
      </section>
    </>
  );
}
