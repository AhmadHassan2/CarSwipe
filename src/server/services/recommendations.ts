import "server-only";
import { db } from "@/server/db";
import type { Prisma } from "@/generated/prisma/client";
import { buildVehicleWhere, vehicleCardSelect, type VehicleCardData } from "./vehicles";
import { rankVehicles, EMPTY_PROFILE, type PreferenceProfile } from "@/features/recommendations/score";
import type { VehicleFilters } from "@/features/vehicles/filters";

const CANDIDATE_POOL = 250;

const candidateSelect = {
  ...vehicleCardSelect,
  latitude: true,
  longitude: true,
  _count: { select: { saved: true } },
} satisfies Prisma.VehicleSelect;

async function buildProfile(userId: string | null): Promise<PreferenceProfile> {
  if (!userId) return EMPTY_PROFILE;
  const [prefs, likes, passes] = await Promise.all([
    db.userPreferences.findUnique({ where: { userId } }),
    db.swipe.findMany({
      where: { userId, direction: "LIKE" },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { vehicle: { select: { make: true, bodyStyle: true, price: true } } },
    }),
    db.swipe.findMany({
      where: { userId, direction: "PASS" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { vehicle: { select: { make: true } } },
    }),
  ]);
  const passedMakes = new Map<string, number>();
  for (const p of passes) passedMakes.set(p.vehicle.make, (passedMakes.get(p.vehicle.make) ?? 0) + 1);
  return {
    minPrice: prefs?.minPrice,
    maxPrice: prefs?.maxPrice,
    makes: prefs?.preferredMakes ?? [],
    bodyStyles: prefs?.bodyStyles ?? [],
    minYear: prefs?.minYear,
    maxYear: prefs?.maxYear,
    maxMileage: prefs?.maxMileage,
    latitude: prefs?.latitude,
    longitude: prefs?.longitude,
    radiusKm: prefs?.radius,
    liked: likes.map((l) => l.vehicle),
    passedMakes,
  };
}

type RankOptions = {
  userId: string | null;
  filters?: VehicleFilters;
  /** Extra ids to skip (e.g. guest swipes held client-side, cards already in the deck). */
  exclude?: string[];
  limit: number;
};

/**
 * Returns active vehicles the user hasn't swiped and doesn't own, filtered by
 * `filters` and ordered by recommendation score.
 */
export async function getRankedVehicles({ userId, filters = {}, exclude = [], limit }: RankOptions): Promise<VehicleCardData[]> {
  const swiped = userId
    ? (await db.swipe.findMany({ where: { userId }, select: { vehicleId: true } })).map((s) => s.vehicleId)
    : [];
  const skip = [...new Set([...swiped, ...exclude])];

  const where: Prisma.VehicleWhereInput = {
    status: "ACTIVE",
    ...(skip.length ? { id: { notIn: skip } } : {}),
    ...(userId ? { sellerId: { not: userId } } : {}),
    ...buildVehicleWhere(filters),
  };

  const [candidates, profile] = await Promise.all([
    db.vehicle.findMany({ where, select: candidateSelect, orderBy: { publishedAt: "desc" }, take: CANDIDATE_POOL }),
    buildProfile(userId),
  ]);

  const ranked = rankVehicles(
    candidates.map((c) => ({ ...c, saveCount: c._count.saved })),
    profile,
  );

  return ranked.slice(0, limit).map(({ latitude: _lat, longitude: _lng, _count: _c, saveCount: _s, ...card }) => card);
}

export function getRecommendations(userId: string | null, limit = 8) {
  return getRankedVehicles({ userId, limit });
}
