import { NextResponse } from "next/server";
import { z } from "zod";
import { readJson, requireUserId, route } from "@/server/api";
import { listingSchema } from "@/features/vehicles/listing-schema";
import { removeListing, setListingStatus, updateListing } from "@/server/services/listings";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = route(async (req: Request, { params }: Ctx) => {
  const userId = await requireUserId();
  const { id } = await params;
  const data = listingSchema.parse(await readJson(req));
  return NextResponse.json(await updateListing(userId, id, data));
});

const statusSchema = z.object({ status: z.enum(["DRAFT", "ACTIVE", "PENDING", "SOLD"]) });

export const PATCH = route(async (req: Request, { params }: Ctx) => {
  const userId = await requireUserId();
  const { id } = await params;
  const { status } = statusSchema.parse(await readJson(req));
  return NextResponse.json(await setListingStatus(userId, id, status));
});

export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  const userId = await requireUserId();
  const { id } = await params;
  return NextResponse.json(await removeListing(userId, id));
});
