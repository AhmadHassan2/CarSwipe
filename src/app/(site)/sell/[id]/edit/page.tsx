import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { AppError } from "@/server/errors";
import { getListingForEdit } from "@/server/services/listings";
import { PageHeader } from "@/components/shared/page-header";
import { ListingForm, type ListingFormValues } from "@/components/sell/listing-form";
import { vehicleTitle } from "@/lib/format";

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditListingPage({ params }: PageProps<"/sell/[id]/edit">) {
  const { id } = await params;
  const userId = (await auth())?.user?.id;
  if (!userId) redirect(`/login?callbackUrl=/sell/${id}/edit`);
  let v;
  try {
    v = await getListingForEdit(userId, id);
  } catch (err) {
    if (err instanceof AppError) notFound();
    throw err;
  }
  const s = (x: string | number | null | undefined) => (x === null || x === undefined ? "" : String(x));
  const initial: ListingFormValues = {
    make: v.make, model: v.model, year: s(v.year), trim: s(v.trim), price: s(v.price), mileage: s(v.mileage),
    condition: v.condition, bodyStyle: s(v.bodyStyle), transmission: s(v.transmission), fuelType: s(v.fuelType), drivetrain: s(v.drivetrain),
    engine: s(v.engine), horsepower: s(v.horsepower), exteriorColour: s(v.exteriorColour), interiorColour: s(v.interiorColour),
    owners: s(v.owners), vin: s(v.vin), location: v.location, description: s(v.description), history: s(v.history),
    features: v.features, images: v.images.map((i) => ({ url: i.imageUrl, key: i.storageKey })),
  };
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader title={`Edit ${vehicleTitle(v)}`} description={v.status === "DRAFT" ? "This listing is a draft and isn't visible to buyers yet." : undefined} />
      <ListingForm vehicleId={v.id} initial={initial} status={v.status} />
    </div>
  );
}
