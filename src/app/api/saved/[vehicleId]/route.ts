import { NextResponse } from "next/server";
import { requireUserId, route } from "@/server/api";
import { saveVehicle, unsaveVehicle } from "@/server/services/saved";

type Ctx = { params: Promise<{ vehicleId: string }> };

export const POST = route(async (_req: Request, { params }: Ctx) => {
  const userId = await requireUserId();
  const { vehicleId } = await params;
  await saveVehicle(userId, vehicleId);
  return NextResponse.json({ saved: true });
});

export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  const userId = await requireUserId();
  const { vehicleId } = await params;
  await unsaveVehicle(userId, vehicleId);
  return NextResponse.json({ saved: false });
});
