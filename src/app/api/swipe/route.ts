import { NextResponse } from "next/server";
import { z } from "zod";
import { enforceLimit, readJson, requireUserId, route } from "@/server/api";
import { recordSwipe } from "@/server/services/swipes";

const bodySchema = z.object({
  vehicleId: z.string().min(1).max(40),
  direction: z.enum(["LIKE", "PASS"]),
});

export const POST = route(async (req: Request) => {
  const userId = await requireUserId();
  enforceLimit("swipe", userId);
  const { vehicleId, direction } = bodySchema.parse(await readJson(req));
  const { saved } = await recordSwipe(userId, vehicleId, direction);
  return NextResponse.json({ ok: true, saved });
});
