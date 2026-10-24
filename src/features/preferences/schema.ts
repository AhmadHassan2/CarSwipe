import { z } from "zod";
import { BODY_STYLES, FUEL_TYPES, SELLER_TYPES, TRANSMISSIONS } from "@/features/vehicles/constants";
import type { VehicleFilters } from "@/features/vehicles/filters";

const int = (max: number) => z.number().int().min(0).max(max).nullable().optional();

export const preferencesSchema = z
  .object({
    preferredMakes: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
    preferredModels: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
    bodyStyles: z.array(z.enum(BODY_STYLES as [string, ...string[]])).default([]),
    transmissions: z.array(z.enum(TRANSMISSIONS as [string, ...string[]])).default([]),
    fuelTypes: z.array(z.enum(FUEL_TYPES as [string, ...string[]])).default([]),
    sellerType: z.enum(SELLER_TYPES as [string, ...string[]]).nullable().optional(),
    minPrice: int(10_000_000),
    maxPrice: int(10_000_000),
    minYear: int(3000),
    maxYear: int(3000),
    maxMileage: int(2_000_000),
    location: z.string().trim().max(80).nullable().optional(),
    radius: int(1000),
  })
  .refine((p) => p.minPrice == null || p.maxPrice == null || p.minPrice <= p.maxPrice, {
    path: ["maxPrice"],
    message: "Max price must be above min price",
  })
  .refine((p) => p.minYear == null || p.maxYear == null || p.minYear <= p.maxYear, {
    path: ["maxYear"],
    message: "End year must be after start year",
  });

export type PreferencesInput = z.input<typeof preferencesSchema>;
export type Preferences = z.output<typeof preferencesSchema>;

type StoredPrefs = {
  preferredMakes: string[];
  preferredModels: string[];
  bodyStyles: string[];
  transmissions: string[];
  fuelTypes: string[];
  sellerType: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  minYear: number | null;
  maxYear: number | null;
  maxMileage: number | null;
  location: string | null;
  radius: number | null;
};

/** Saved discovery preferences expressed as the shared filter shape. */
export function preferencesToFilters(p: StoredPrefs | null | undefined): VehicleFilters {
  if (!p) return {};
  const f: VehicleFilters = {
    makes: p.preferredMakes.length ? p.preferredMakes : undefined,
    models: p.preferredModels.length ? p.preferredModels : undefined,
    bodyStyles: p.bodyStyles.length ? (p.bodyStyles as VehicleFilters["bodyStyles"]) : undefined,
    transmissions: p.transmissions.length ? (p.transmissions as VehicleFilters["transmissions"]) : undefined,
    fuelTypes: p.fuelTypes.length ? (p.fuelTypes as VehicleFilters["fuelTypes"]) : undefined,
    sellerType: p.sellerType ?? undefined,
    minPrice: p.minPrice ?? undefined,
    maxPrice: p.maxPrice ?? undefined,
    minYear: p.minYear ?? undefined,
    maxYear: p.maxYear ?? undefined,
    maxMileage: p.maxMileage ?? undefined,
    location: p.location ?? undefined,
    radius: p.radius ?? undefined,
  };
  return Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined)) as VehicleFilters;
}

export function filtersToPreferences(f: VehicleFilters): Preferences {
  return {
    preferredMakes: f.makes ?? [],
    preferredModels: f.models ?? [],
    bodyStyles: f.bodyStyles ?? [],
    transmissions: f.transmissions ?? [],
    fuelTypes: f.fuelTypes ?? [],
    sellerType: f.sellerType ?? null,
    minPrice: f.minPrice ?? null,
    maxPrice: f.maxPrice ?? null,
    minYear: f.minYear ?? null,
    maxYear: f.maxYear ?? null,
    maxMileage: f.maxMileage ?? null,
    location: f.location ?? null,
    radius: f.radius ?? null,
  };
}
