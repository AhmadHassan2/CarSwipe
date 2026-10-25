import "server-only";
import { db } from "@/server/db";
import { AppError } from "@/server/errors";
import { deleteStoredImage, isOwnUpload } from "@/server/storage/images";
import { cityLabel, findCity } from "@/lib/locations";
import { vehicleTitle } from "@/lib/format";
import type { ListingData } from "@/features/vehicles/listing-schema";
import type { BodyStyle, Condition, Drivetrain, FuelType, Transmission, VehicleStatus } from "@/generated/prisma/enums";

async function getOwned(userId: string, vehicleId: string) {
  const v = await db.vehicle.findUnique({
    where: { id: vehicleId },
    select: { id: true, sellerId: true, status: true, publishedAt: true, images: { select: { id: true, imageUrl: true, storageKey: true } } },
  });
  // Same error for missing and not-yours, so ids can't be probed.
  if (!v || v.sellerId !== userId || v.status === "REMOVED") throw new AppError("NOT_FOUND", "Listing not found");
  return v;
}

function toColumns(data: ListingData) {
  const city = findCity(data.location);
  return {
    make: data.make,
    model: data.model,
    year: data.year,
    trim: data.trim ?? null,
    price: data.price,
    mileage: data.mileage,
    condition: data.condition as Condition,
    bodyStyle: data.bodyStyle as BodyStyle,
    transmission: data.transmission as Transmission,
    fuelType: data.fuelType as FuelType,
    drivetrain: (data.drivetrain ?? null) as Drivetrain | null,
    engine: data.engine ?? null,
    horsepower: data.horsepower ?? null,
    exteriorColour: data.exteriorColour ?? null,
    interiorColour: data.interiorColour ?? null,
    owners: data.owners ?? null,
    vin: data.vin ?? null,
    location: city ? cityLabel(city) : data.location,
    latitude: city?.lat ?? null,
    longitude: city?.lng ?? null,
    description: data.description,
    history: data.history ?? null,
    features: [...new Set(data.features)],
  };
}

function checkImages(userId: string, images: ListingData["images"], existingUrls: Set<string>) {
  const seen = new Set<string>();
  for (const img of images) {
    if (seen.has(img.url)) throw new AppError("INVALID", "The same photo was added twice");
    seen.add(img.url);
    if (!existingUrls.has(img.url) && !isOwnUpload(userId, img.url)) throw new AppError("INVALID", "One of the photos couldn't be verified. Please re-upload it.");
  }
}

export async function createListing(userId: string, data: ListingData) {
  checkImages(userId, data.images, new Set());
  if (data.publish && !data.images.length) throw new AppError("INVALID", "Add at least one photo before publishing");
  const title = vehicleTitle(data);
  return db.vehicle.create({
    data: {
      ...toColumns(data),
      sellerId: userId,
      status: data.publish ? "ACTIVE" : "DRAFT",
      publishedAt: data.publish ? new Date() : null,
      images: {
        create: data.images.map((img, position) => ({
          imageUrl: img.url,
          storageKey: isOwnUpload(userId, img.url) ? (img.key ?? null) : null,
          alt: position === 0 ? title : `${title} photo ${position + 1}`,
          position,
        })),
      },
    },
    select: { id: true, status: true },
  });
}

export async function updateListing(userId: string, vehicleId: string, data: ListingData) {
  const current = await getOwned(userId, vehicleId);
  const byUrl = new Map(current.images.map((i) => [i.imageUrl, i]));
  checkImages(userId, data.images, new Set(byUrl.keys()));

  const goingLive = data.publish && current.status === "DRAFT";
  const willBeVisible = goingLive || current.status !== "DRAFT";
  if (willBeVisible && !data.images.length) throw new AppError("INVALID", "A published listing needs at least one photo");

  const keep = new Set(data.images.map((i) => i.url));
  const removed = current.images.filter((i) => !keep.has(i.imageUrl));
  const title = vehicleTitle(data);

  const result = await db.$transaction(async (tx) => {
    await tx.vehicleImage.deleteMany({ where: { vehicleId, id: { in: removed.map((r) => r.id) } } });
    for (const [position, img] of data.images.entries()) {
      const alt = position === 0 ? title : `${title} photo ${position + 1}`;
      const existing = byUrl.get(img.url);
      if (existing) await tx.vehicleImage.update({ where: { id: existing.id }, data: { position, alt } });
      else await tx.vehicleImage.create({ data: { vehicleId, imageUrl: img.url, storageKey: img.key ?? null, alt, position } });
    }
    return tx.vehicle.update({
      where: { id: vehicleId },
      data: {
        ...toColumns(data),
        ...(goingLive ? { status: "ACTIVE" as const, publishedAt: current.publishedAt ?? new Date() } : {}),
      },
      select: { id: true, status: true },
    });
  });
  await Promise.all(removed.map((r) => deleteStoredImage(r.storageKey)));
  return result;
}

const TRANSITIONS: Record<VehicleStatus, VehicleStatus[]> = {
  DRAFT: ["ACTIVE"],
  ACTIVE: ["PENDING", "SOLD", "DRAFT"],
  PENDING: ["ACTIVE", "SOLD"],
  SOLD: ["ACTIVE"],
  REMOVED: [],
};

export async function setListingStatus(userId: string, vehicleId: string, status: VehicleStatus) {
  const v = await getOwned(userId, vehicleId);
  if (status === "REMOVED") return removeListing(userId, vehicleId);
  if (!TRANSITIONS[v.status].includes(status)) throw new AppError("INVALID", `Can't change a ${v.status.toLowerCase()} listing to ${status.toLowerCase()}`);
  if (status === "ACTIVE" && !v.images.length) throw new AppError("INVALID", "Add at least one photo before publishing");
  return db.vehicle.update({
    where: { id: vehicleId },
    data: {
      status,
      publishedAt: status === "ACTIVE" ? (v.publishedAt ?? new Date()) : undefined,
      soldAt: status === "SOLD" ? new Date() : status === "ACTIVE" ? null : undefined,
    },
    select: { id: true, status: true },
  });
}

/** Soft delete: keeps conversations intact for both sides; hides the listing everywhere else. */
export async function removeListing(userId: string, vehicleId: string) {
  await getOwned(userId, vehicleId);
  return db.vehicle.update({ where: { id: vehicleId }, data: { status: "REMOVED" }, select: { id: true, status: true } });
}

export async function getListingForEdit(userId: string, vehicleId: string) {
  await getOwned(userId, vehicleId);
  return db.vehicle.findUniqueOrThrow({
    where: { id: vehicleId },
    include: { images: { orderBy: { position: "asc" }, select: { imageUrl: true, storageKey: true } } },
  });
}

/** Seller dashboard data: own listings with engagement counts. */
export async function listOwnListings(userId: string) {
  const rows = await db.vehicle.findMany({
    where: { sellerId: userId, status: { not: "REMOVED" } },
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true, make: true, model: true, year: true, trim: true, price: true, mileage: true, status: true, publishedAt: true, updatedAt: true,
      images: { orderBy: { position: "asc" }, take: 1, select: { imageUrl: true } },
      _count: { select: { views: true, saved: true, conversations: true } },
    },
  });
  return rows;
}
export type OwnListing = Awaited<ReturnType<typeof listOwnListings>>[number];

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Daily views across the seller's listings for the last `days` days (server-local dates). */
export async function getViewsSeries(userId: string, days = 14) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));
  const views = await db.listingView.findMany({
    where: { createdAt: { gte: since }, vehicle: { sellerId: userId } },
    select: { createdAt: true },
  });
  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    buckets.set(dayKey(d), 0);
  }
  for (const v of views) {
    const k = dayKey(v.createdAt);
    if (buckets.has(k)) buckets.set(k, buckets.get(k)! + 1);
  }
  return [...buckets.entries()].map(([date, count]) => ({ date, count }));
}
