import { NextResponse } from "next/server";
import { z } from "zod";
import { readJson, requireUserId, route } from "@/server/api";
import { undoLastSwipe } from "@/server/services/swipes";

const bodySchema = z.object({ vehicleId: z.string().min(1).max(40) });

export const POST = route(async (req: Request) => {
  const userId = await requireUserId();
  const { vehicleId } = bodySchema.parse(await readJson(req));
  return NextResponse.json(await undoLastSwipe(userId, vehicleId));
});
