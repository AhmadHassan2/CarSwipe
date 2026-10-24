import "server-only";
import { db } from "@/server/db";
import { AppError } from "@/server/errors";
import type { SwipeDirection } from "@/generated/prisma/enums";

async function assertSwipeable(userId: string, vehicleId: string) {
  const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId }, select: { status: true, sellerId: true } });
  if (!vehicle || vehicle.status !== "ACTIVE") throw new AppError("NOT_FOUND", "This listing is no longer available");
  if (vehicle.sellerId === userId) throw new AppError("INVALID", "You can't swipe on your own listing");
}

/**
 * Idempotent: swiping the same vehicle twice updates the single row (unique
 * on userId+vehicleId), so rapid double-submits can't create duplicates.
 */
export async function recordSwipe(userId: string, vehicleId: string, direction: SwipeDirection) {
  await assertSwipeable(userId, vehicleId);
  return db.$transaction(async (tx) => {
    const swipe = await tx.swipe.upsert({
      where: { userId_vehicleId: { userId, vehicleId } },
      create: { userId, vehicleId, direction },
      update: { direction, createdAt: new Date() },
    });
    let saved = false;
    if (direction === "LIKE") {
      await tx.savedVehicle.upsert({
        where: { userId_vehicleId: { userId, vehicleId } },
        create: { userId, vehicleId, viaSwipe: true },
        update: {},
      });
      saved = true;
    }
    return { swipe, saved };
  });
}

/**
 * Undoes the user's most recent swipe. `vehicleId` must match it, which
 * stops stale clients from undoing an older swipe after a newer one landed.
 */
export async function undoLastSwipe(userId: string, vehicleId: string) {
  return db.$transaction(async (tx) => {
    const last = await tx.swipe.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
    if (!last || last.vehicleId !== vehicleId) throw new AppError("CONFLICT", "Only your most recent swipe can be undone");
    await tx.swipe.delete({ where: { id: last.id } });
    let unsaved = false;
    if (last.direction === "LIKE") {
      const res = await tx.savedVehicle.deleteMany({ where: { userId, vehicleId, viaSwipe: true } });
      unsaved = res.count > 0;
    }
    return { vehicleId, direction: last.direction, unsaved };
  });
}

/** Imports swipes made while signed out. Ignores unknown, inactive or own vehicles. */
export async function importGuestSwipes(userId: string, swipes: { vehicleId: string; direction: SwipeDirection }[]) {
  const ids = [...new Set(swipes.map((s) => s.vehicleId))].slice(0, 200);
  const valid = new Set(
    (await db.vehicle.findMany({ where: { id: { in: ids }, status: "ACTIVE", sellerId: { not: userId } }, select: { id: true } })).map((v) => v.id),
  );
  let imported = 0;
  for (const s of swipes) {
    if (!valid.has(s.vehicleId)) continue;
    await recordSwipe(userId, s.vehicleId, s.direction);
    imported++;
  }
  return { imported };
}

export async function getSwipeStats(userId: string) {
  const rows = await db.swipe.groupBy({ by: ["direction"], where: { userId }, _count: { _all: true } });
  const likes = rows.find((r) => r.direction === "LIKE")?._count._all ?? 0;
  const passes = rows.find((r) => r.direction === "PASS")?._count._all ?? 0;
  return { likes, passes };
}
