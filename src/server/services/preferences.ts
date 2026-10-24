import "server-only";
import { db } from "@/server/db";
import { findCity, cityLabel } from "@/lib/locations";
import type { Preferences } from "@/features/preferences/schema";
import type { BodyStyle, FuelType, SellerType, Transmission } from "@/generated/prisma/enums";

export function getPreferences(userId: string) {
  return db.userPreferences.findUnique({ where: { userId } });
}

export async function savePreferences(userId: string, input: Preferences, opts: { onboarded?: boolean } = {}) {
  const city = findCity(input.location);
  const data = {
    preferredMakes: input.preferredMakes,
    preferredModels: input.preferredModels,
    bodyStyles: input.bodyStyles as BodyStyle[],
    transmissions: input.transmissions as Transmission[],
    fuelTypes: input.fuelTypes as FuelType[],
    sellerType: (input.sellerType ?? null) as SellerType | null,
    minPrice: input.minPrice ?? null,
    maxPrice: input.maxPrice ?? null,
    minYear: input.minYear ?? null,
    maxYear: input.maxYear ?? null,
    maxMileage: input.maxMileage ?? null,
    location: city ? cityLabel(city) : input.location || null,
    latitude: city?.lat ?? null,
    longitude: city?.lng ?? null,
    radius: input.radius ?? null,
    ...(opts.onboarded ? { onboardedAt: new Date() } : {}),
  };
  return db.userPreferences.upsert({ where: { userId }, create: { userId, ...data }, update: data });
}

export async function markOnboarded(userId: string) {
  return db.userPreferences.upsert({
    where: { userId },
    create: { userId, onboardedAt: new Date() },
    update: { onboardedAt: new Date() },
  });
}
