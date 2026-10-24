import "server-only";
import { db } from "@/server/db";
import { AppError } from "@/server/errors";
import { vehicleCardSelect } from "./vehicles";
import type { Prisma } from "@/generated/prisma/client";

export async function getSavedIds(userId: string) {
  const rows = await db.savedVehicle.findMany({ where: { userId }, select: { vehicleId: true } });
  return rows.map((r) => r.vehicleId);
}

export const SAVED_SORTS = {
  saved_desc: "Recently saved",
  price_asc: "Lowest price",
  price_desc: "Highest price",
  year_desc: "Newest model year",
} as const;
export type SavedSort = keyof typeof SAVED_SORTS;

export async function listSaved(userId: string, opts: { sort?: SavedSort; q?: string; bodyStyle?: string } = {}) {
  const vehicleWhere: Prisma.VehicleWhereInput = {};
  if (opts.q) {
    vehicleWhere.OR = [
      { make: { contains: opts.q, mode: "insensitive" } },
      { model: { contains: opts.q, mode: "insensitive" } },
    ];
  }
  if (opts.bodyStyle) vehicleWhere.bodyStyle = opts.bodyStyle as Prisma.VehicleWhereInput["bodyStyle"];

  const orderBy: Prisma.SavedVehicleOrderByWithRelationInput =
    opts.sort === "price_asc"
      ? { vehicle: { price: "asc" } }
      : opts.sort === "price_desc"
        ? { vehicle: { price: "desc" } }
        : opts.sort === "year_desc"
          ? { vehicle: { year: "desc" } }
          : { createdAt: "desc" };

  return db.savedVehicle.findMany({
    where: { userId, vehicle: vehicleWhere },
    orderBy,
    select: { createdAt: true, vehicle: { select: vehicleCardSelect } },
  });
}

export async function saveVehicle(userId: string, vehicleId: string) {
  const vehicle = await db.vehicle.findUnique({
    where: { id: vehicleId },
    select: { status: true, sellerId: true, year: true, make: true, model: true },
  });
  if (!vehicle || vehicle.status === "DRAFT" || vehicle.status === "REMOVED") throw new AppError("NOT_FOUND", "Listing not found");
  if (vehicle.sellerId === userId) throw new AppError("INVALID", "You can't save your own listing");
  const existing = await db.savedVehicle.findUnique({ where: { userId_vehicleId: { userId, vehicleId } } });
  if (existing) return existing;
  const saved = await db.savedVehicle.create({ data: { userId, vehicleId } });
  return saved;
}

export async function unsaveVehicle(userId: string, vehicleId: string) {
  await db.savedVehicle.deleteMany({ where: { userId, vehicleId } });
}
