import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/server/auth";
import { route } from "@/server/api";
import { parseFilters } from "@/features/vehicles/filters";
import { getRankedVehicles } from "@/server/services/recommendations";

export const GET = route(async (req: NextRequest) => {
  const session = await auth();
  const params = req.nextUrl.searchParams;
  const exclude = (params.get("exclude") ?? "").split(",").filter(Boolean).slice(0, 300);
  const limit = Math.min(20, Math.max(1, Number(params.get("limit")) || 10));
  const vehicles = await getRankedVehicles({
    userId: session?.user?.id ?? null,
    filters: parseFilters(params),
    exclude,
    limit,
  });
  return NextResponse.json({ vehicles });
});
