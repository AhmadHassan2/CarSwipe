import { NextResponse, type NextRequest } from "next/server";
import { route } from "@/server/api";
import { getVehiclesByIds } from "@/server/services/vehicles";

/** Public lookup by ids — used by compare and guest garage. */
export const GET = route(async (req: NextRequest) => {
  const ids = (req.nextUrl.searchParams.get("ids") ?? "").split(",").filter(Boolean).slice(0, 50);
  return NextResponse.json({ vehicles: await getVehiclesByIds(ids) });
});
