import { NextResponse } from "next/server";
import { z } from "zod";
import { readJson, requireUserId, route } from "@/server/api";
import { importGuestSwipes } from "@/server/services/swipes";

const bodySchema = z.object({
  swipes: z.array(z.object({ vehicleId: z.string().min(1).max(40), direction: z.enum(["LIKE", "PASS"]) })).max(200),
});

export const POST = route(async (req: Request) => {
  const userId = await requireUserId();
  const { swipes } = bodySchema.parse(await readJson(req));
  return NextResponse.json(await importGuestSwipes(userId, swipes));
});
