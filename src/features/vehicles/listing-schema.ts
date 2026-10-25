import { z } from "zod";
import { BODY_STYLES, CONDITIONS, DRIVETRAINS, FUEL_TYPES, MAX_YEAR, MIN_YEAR, TRANSMISSIONS } from "./constants";

export const MAX_PHOTOS = 20;

const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().trim().max(max).optional());

const optionalInt = (min: number, max: number, label: string) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined || (typeof v === "number" && Number.isNaN(v)) ? undefined : Number(v)),
    z.number({ error: `Enter a valid ${label}` }).int(`Enter a whole number`).min(min, `${label} looks too low`).max(max, `${label} looks too high`).optional(),
  );

const requiredInt = (min: number, max: number, label: string) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(String(v).replace(/[,\s$]/g, ""))),
    z.number({ error: `Enter the ${label}` }).int("Enter a whole number").min(min, `${label} looks too low`).max(max, `${label} looks too high`),
  );

/** Selects post "" for "not chosen"; treat that as missing so the friendly message (or optional) applies. */
const choice = <T extends string>(values: readonly T[], message: string) =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), z.enum(values as [T, ...T[]], { error: message }));
const optionalChoice = <T extends string>(values: readonly T[], message: string) =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), z.enum(values as [T, ...T[]], { error: message }).optional());

export const listingSchema = z.object({
  make: z.string().trim().min(1, "Enter the make").max(60),
  model: z.string().trim().min(1, "Enter the model").max(80),
  year: requiredInt(MIN_YEAR, MAX_YEAR, "year"),
  trim: optionalText(80),
  price: requiredInt(500, 5_000_000, "price"),
  mileage: requiredInt(0, 1_500_000, "mileage"),
  condition: z.preprocess((v) => (v === "" || v == null ? "USED" : v), z.enum(CONDITIONS as [string, ...string[]], { error: "Choose a condition" })),
  bodyStyle: choice(BODY_STYLES, "Choose a body style"),
  transmission: choice(TRANSMISSIONS, "Choose a transmission"),
  fuelType: choice(FUEL_TYPES, "Choose a fuel type"),
  drivetrain: optionalChoice(DRIVETRAINS, "Choose a drivetrain"),
  engine: optionalText(120),
  horsepower: optionalInt(20, 2500, "horsepower"),
  exteriorColour: optionalText(60),
  interiorColour: optionalText(60),
  owners: optionalInt(0, 30, "number of owners"),
  vin: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toUpperCase() || undefined : v),
    z.string().regex(/^[A-HJ-NPR-Z0-9]{17}$/, "A VIN is 17 letters and numbers (no I, O or Q)").optional(),
  ),
  location: z.string().trim().min(2, "Choose where the car is").max(120),
  description: z.string().trim().min(30, "Tell buyers a bit more (at least 30 characters)").max(5000),
  history: optionalText(2000),
  features: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
  images: z
    .array(z.object({ url: z.string().min(1).max(1024), key: z.string().max(512).nullish() }))
    .max(MAX_PHOTOS, `Up to ${MAX_PHOTOS} photos`)
    .default([]),
  publish: z.boolean().default(false),
});

export type ListingInput = z.input<typeof listingSchema>;
export type ListingData = z.output<typeof listingSchema>;
