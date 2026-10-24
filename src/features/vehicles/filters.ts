import { z } from "zod";
import {
  BODY_STYLES,
  CONDITIONS,
  DRIVETRAINS,
  FUEL_TYPES,
  SELLER_TYPES,
  TRANSMISSIONS,
} from "./constants";

/**
 * One filter shape shared by browse, swipe and saved views. It round-trips
 * through URL search params (lists are comma-separated) so searches can be
 * bookmarked, and the server turns it into a Prisma `where`.
 */

export const SORT_OPTIONS = {
  newest: "Newest listings",
  price_asc: "Lowest price",
  price_desc: "Highest price",
  mileage_asc: "Lowest mileage",
  year_desc: "Newest model year",
} as const;
export type SortOption = keyof typeof SORT_OPTIONS;

const optionalInt = (max: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().int().min(0).max(max).optional().catch(undefined),
  );

const list = <T extends string>(values: readonly [T, ...T[]] | T[]) =>
  z.preprocess(
    (v) => {
      if (v === undefined || v === null || v === "") return undefined;
      const arr = Array.isArray(v) ? v : String(v).split(",");
      return arr.map((s) => String(s).trim()).filter(Boolean);
    },
    z
      .array(z.string())
      .transform((arr) => arr.filter((s): s is T => (values as readonly string[]).includes(s)))
      .optional(),
  );

const freeList = z.preprocess(
  (v) => {
    if (v === undefined || v === null || v === "") return undefined;
    const arr = Array.isArray(v) ? v : String(v).split(",");
    return arr.map((s) => String(s).trim().slice(0, 60)).filter(Boolean).slice(0, 20);
  },
  z.array(z.string()).optional(),
);

export const vehicleFiltersSchema = z.object({
  q: z.preprocess(
    (v) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 100) : undefined),
    z.string().optional(),
  ),
  minPrice: optionalInt(10_000_000),
  maxPrice: optionalInt(10_000_000),
  minYear: optionalInt(3000),
  maxYear: optionalInt(3000),
  maxMileage: optionalInt(2_000_000),
  makes: freeList,
  models: freeList,
  bodyStyles: list(BODY_STYLES),
  transmissions: list(TRANSMISSIONS),
  fuelTypes: list(FUEL_TYPES),
  drivetrains: list(DRIVETRAINS),
  conditions: list(CONDITIONS),
  sellerType: z.enum(SELLER_TYPES as [string, ...string[]]).optional().catch(undefined),
  location: z.preprocess(
    (v) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 80) : undefined),
    z.string().optional(),
  ),
  radius: optionalInt(1000),
  sort: z
    .enum(Object.keys(SORT_OPTIONS) as [SortOption, ...SortOption[]])
    .optional()
    .catch(undefined),
  page: optionalInt(10_000),
});

export type VehicleFilters = z.infer<typeof vehicleFiltersSchema>;

type ParamSource =
  | URLSearchParams
  | Record<string, string | string[] | undefined>
  | ReadonlyURLSearchParamsLike;

interface ReadonlyURLSearchParamsLike {
  get(name: string): string | null;
  forEach(cb: (value: string, key: string) => void): void;
}

export function parseFilters(source: ParamSource): VehicleFilters {
  const raw: Record<string, string | string[]> = {};
  if (typeof (source as URLSearchParams).forEach === "function" && typeof (source as URLSearchParams).get === "function") {
    (source as URLSearchParams).forEach((value, key) => {
      raw[key] = value;
    });
  } else {
    for (const [key, value] of Object.entries(source as Record<string, string | string[] | undefined>)) {
      if (value !== undefined) raw[key] = value;
    }
  }
  const parsed = vehicleFiltersSchema.safeParse(raw);
  return parsed.success ? stripEmpty(parsed.data) : {};
}

function stripEmpty(f: VehicleFilters): VehicleFilters {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(f)) {
    if (v === undefined) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out as VehicleFilters;
}

export function filtersToSearchParams(filters: VehicleFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(stripEmpty(filters))) {
    if (Array.isArray(value)) params.set(key, value.join(","));
    else params.set(key, String(value));
  }
  return params;
}

/** Number of user-facing filters applied (search, sort and page excluded). */
export function countActiveFilters(filters: VehicleFilters) {
  const { q: _q, sort: _sort, page: _page, radius: _radius, ...rest } = stripEmpty(filters);
  return Object.keys(rest).length;
}
