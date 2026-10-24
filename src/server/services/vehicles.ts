import "server-only";
import { db } from "@/server/db";
import type { Prisma } from "@/generated/prisma/client";
import type { BodyStyle } from "@/generated/prisma/enums";
import type { VehicleFilters, SortOption } from "@/features/vehicles/filters";
import { boundingBox, findCity } from "@/lib/locations";

export const vehicleCardSelect = {
  id: true,
  make: true,
  model: true,
  year: true,
  trim: true,
  price: true,
  mileage: true,
  location: true,
  transmission: true,
  fuelType: true,
  drivetrain: true,
  bodyStyle: true,
  condition: true,
  status: true,
  isDemo: true,
  publishedAt: true,
  createdAt: true,
  sellerId: true,
  images: { orderBy: { position: "asc" }, take: 5, select: { id: true, imageUrl: true, alt: true } },
  seller: { select: { sellerType: true, name: true, dealerName: true } },
} satisfies Prisma.VehicleSelect;

export type VehicleCardData = Prisma.VehicleGetPayload<{ select: typeof vehicleCardSelect }>;

export const PAGE_SIZE = 24;

const ORDER_BY: Record<SortOption, Prisma.VehicleOrderByWithRelationInput[]> = {
  newest: [{ publishedAt: "desc" }, { id: "desc" }],
  price_asc: [{ price: "asc" }, { id: "asc" }],
  price_desc: [{ price: "desc" }, { id: "asc" }],
  mileage_asc: [{ mileage: "asc" }, { id: "asc" }],
  year_desc: [{ year: "desc" }, { publishedAt: "desc" }],
};

/** Shared filter → Prisma translation used by browse, swipe and recommendations. */
export function buildVehicleWhere(f: VehicleFilters): Prisma.VehicleWhereInput {
  const and: Prisma.VehicleWhereInput[] = [];

  if (f.q) {
    for (const term of f.q.split(/\s+/).filter(Boolean).slice(0, 6)) {
      const or: Prisma.VehicleWhereInput[] = [
        { make: { contains: term, mode: "insensitive" } },
        { model: { contains: term, mode: "insensitive" } },
        { trim: { contains: term, mode: "insensitive" } },
        { location: { contains: term, mode: "insensitive" } },
        { exteriorColour: { contains: term, mode: "insensitive" } },
        { engine: { contains: term, mode: "insensitive" } },
      ];
      if (/^(19|20)\d{2}$/.test(term)) or.push({ year: Number(term) });
      and.push({ OR: or });
    }
  }

  if (f.minPrice !== undefined || f.maxPrice !== undefined)
    and.push({ price: { gte: f.minPrice, lte: f.maxPrice } });
  if (f.minYear !== undefined || f.maxYear !== undefined)
    and.push({ year: { gte: f.minYear, lte: f.maxYear } });
  if (f.maxMileage !== undefined) and.push({ mileage: { lte: f.maxMileage } });
  if (f.makes?.length) and.push({ make: { in: f.makes, mode: "insensitive" } });
  if (f.models?.length) and.push({ model: { in: f.models, mode: "insensitive" } });
  if (f.bodyStyles?.length) and.push({ bodyStyle: { in: f.bodyStyles } });
  if (f.transmissions?.length) and.push({ transmission: { in: f.transmissions } });
  if (f.fuelTypes?.length) and.push({ fuelType: { in: f.fuelTypes } });
  if (f.drivetrains?.length) and.push({ drivetrain: { in: f.drivetrains } });
  if (f.conditions?.length) and.push({ condition: { in: f.conditions } });
  if (f.sellerType) and.push({ seller: { sellerType: f.sellerType as "PRIVATE" | "DEALER" } });

  if (f.location) {
    const city = findCity(f.location);
    if (city && f.radius) {
      const box = boundingBox(city.lat, city.lng, f.radius);
      and.push({
        latitude: { gte: box.minLat, lte: box.maxLat },
        longitude: { gte: box.minLng, lte: box.maxLng },
      });
    } else {
      and.push({ location: { contains: city?.name ?? f.location, mode: "insensitive" } });
    }
  }

  return and.length ? { AND: and } : {};
}

export async function listVehicles(filters: VehicleFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const where: Prisma.VehicleWhereInput = { status: "ACTIVE", ...buildVehicleWhere(filters) };
  const [items, total] = await Promise.all([
    db.vehicle.findMany({
      where,
      select: vehicleCardSelect,
      orderBy: ORDER_BY[filters.sort ?? "newest"],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.vehicle.count({ where }),
  ]);
  return { items, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getVehicleDetail(id: string) {
  return db.vehicle.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      seller: {
        select: { id: true, name: true, dealerName: true, sellerType: true, image: true, createdAt: true, _count: { select: { vehicles: { where: { status: "ACTIVE" } } } } },
      },
      _count: { select: { saved: true } },
    },
  });
}
export type VehicleDetail = NonNullable<Awaited<ReturnType<typeof getVehicleDetail>>>;

export async function getRelatedVehicles(v: { id: string; make: string; bodyStyle: BodyStyle | null; price: number }, take = 4) {
  return db.vehicle.findMany({
    where: {
      status: "ACTIVE",
      id: { not: v.id },
      OR: [
        { make: v.make },
        {
          bodyStyle: v.bodyStyle ?? undefined,
          price: { gte: Math.round(v.price * 0.7), lte: Math.round(v.price * 1.3) },
        },
      ],
    },
    select: vehicleCardSelect,
    orderBy: { publishedAt: "desc" },
    take,
  });
}

export async function getVehiclesByIds(ids: string[]) {
  if (!ids.length) return [];
  const rows = await db.vehicle.findMany({
    where: { id: { in: ids.slice(0, 50) }, status: { not: "DRAFT" } },
    select: vehicleCardSelect,
  });
  const order = new Map(ids.map((id, i) => [id, i]));
  return rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export async function getFeaturedVehicles(take = 8) {
  return db.vehicle.findMany({
    where: { status: "ACTIVE" },
    select: vehicleCardSelect,
    orderBy: [{ saved: { _count: "desc" } }, { publishedAt: "desc" }],
    take,
  });
}

/** Records a detail-page view, deduped per viewer per hour. */
export async function recordView(vehicleId: string, viewerId: string | null) {
  if (viewerId) {
    const recent = await db.listingView.findFirst({
      where: { vehicleId, viewerId, createdAt: { gte: new Date(Date.now() - 3_600_000) } },
      select: { id: true },
    });
    if (recent) return;
  }
  await db.listingView.create({ data: { vehicleId, viewerId } });
}

export async function getRecentlyViewed(userId: string, take = 8) {
  const views = await db.listingView.findMany({
    where: { viewerId: userId },
    orderBy: { createdAt: "desc" },
    select: { vehicleId: true },
    take: 60,
  });
  const ids = [...new Set(views.map((v) => v.vehicleId))].slice(0, take);
  return getVehiclesByIds(ids);
}

export async function getMakeOptions() {
  const rows = await db.vehicle.groupBy({
    by: ["make"],
    where: { status: "ACTIVE" },
    _count: { _all: true },
    orderBy: { make: "asc" },
  });
  return rows.map((r) => ({ make: r.make, count: r._count._all }));
}

export async function getModelOptions(makes: string[]) {
  if (!makes.length) return [];
  const rows = await db.vehicle.groupBy({
    by: ["make", "model"],
    where: { status: "ACTIVE", make: { in: makes } },
    orderBy: [{ make: "asc" }, { model: "asc" }],
  });
  return rows.map((r) => ({ make: r.make, model: r.model }));
}
