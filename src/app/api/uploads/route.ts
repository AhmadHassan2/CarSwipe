import { NextResponse } from "next/server";
import { enforceLimit, requireUserId, route } from "@/server/api";
import { AppError } from "@/server/errors";
import { storeListingImage } from "@/server/storage/images";

export const POST = route(async (req: Request) => {
  const userId = await requireUserId();
  enforceLimit("upload", userId);
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw new AppError("INVALID", "Attach a photo to upload");
  const stored = await storeListingImage(userId, file);
  return NextResponse.json(stored, { status: 201 });
});
