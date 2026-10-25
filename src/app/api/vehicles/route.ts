import { NextResponse, type NextRequest } from "next/server";
import { route } from "@/server/api";
import { getCompareVehicles, getVehiclesByIds } from "@/server/services/vehicles";

/** Public lookup by ids. `?view=compare` returns the extra spec fields for the compare table. */
export const GET = route(async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const ids = (params.get("ids") ?? "").split(",").filter(Boolean).slice(0, 50);
  const vehicles = params.get("view") === "compare" ? await getCompareVehicles(ids) : await getVehiclesByIds(ids);
  return NextResponse.json({ vehicles });
});
