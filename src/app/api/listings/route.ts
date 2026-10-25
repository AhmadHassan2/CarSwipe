import { NextResponse } from "next/server";
import { readJson, requireUserId, route } from "@/server/api";
import { listingSchema } from "@/features/vehicles/listing-schema";
import { createListing } from "@/server/services/listings";

export const POST = route(async (req: Request) => {
  const userId = await requireUserId();
  const data = listingSchema.parse(await readJson(req));
  const listing = await createListing(userId, data);
  return NextResponse.json(listing, { status: 201 });
});
