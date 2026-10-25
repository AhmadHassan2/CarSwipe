import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { PageHeader } from "@/components/shared/page-header";
import { EMPTY_LISTING, ListingForm } from "@/components/sell/listing-form";

export const metadata: Metadata = { title: "Sell your car" };

export default async function SellPage() {
  if (!(await auth())?.user?.id) redirect("/login?callbackUrl=/sell");
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader title="Sell your car" description="Listing is free. Buyers who match your car will see it in their swipe deck." />
      <ListingForm initial={EMPTY_LISTING} />
    </div>
  );
}
