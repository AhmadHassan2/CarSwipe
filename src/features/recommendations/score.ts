import { distanceKm } from "@/lib/locations";
import { DEFAULT_WEIGHTS, normalizeWeights, type RecommendationWeights } from "./config";

/**
 * Deterministic, explainable scoring. Each component returns 0..1, or null
 * when the user has expressed no preference for it; null components are
 * dropped and the remaining weights re-normalised, so a user who only set a
 * budget is ranked purely on budget fit (plus the cold-start prior).
 *
 * This module is pure so a learned model can replace it behind the same
 * `scoreVehicle(candidate, profile)` signature later.
 */

export type ScoringCandidate = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  bodyStyle: string | null;
  latitude: number | null;
  longitude: number | null;
  publishedAt: Date | null;
  saveCount: number;
};

export type PreferenceProfile = {
  minPrice?: number | null;
  maxPrice?: number | null;
  makes: string[];
  bodyStyles: string[];
  minYear?: number | null;
  maxYear?: number | null;
  maxMileage?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number | null;
  liked: { make: string; bodyStyle: string | null; price: number }[];
  passedMakes: Map<string, number>;
};

export const EMPTY_PROFILE: PreferenceProfile = { makes: [], bodyStyles: [], liked: [], passedMakes: new Map() };

const clamp = (n: number) => Math.max(0, Math.min(1, n));

function budgetScore(price: number, p: PreferenceProfile) {
  if (p.maxPrice == null && p.minPrice == null) return null;
  const max = p.maxPrice ?? Infinity;
  const min = p.minPrice ?? 0;
  if (price >= min && price <= max) return 1;
  // Soft falloff: 20% over budget scores 0.
  if (price > max) return clamp(1 - (price - max) / (max * 0.2));
  return clamp(1 - (min - price) / (min * 0.5 || 1));
}

function brandScore(make: string, p: PreferenceProfile) {
  if (!p.makes.length) return null;
  return p.makes.some((m) => m.toLowerCase() === make.toLowerCase()) ? 1 : 0;
}

function bodyScore(body: string | null, p: PreferenceProfile) {
  if (!p.bodyStyles.length) return null;
  return body && p.bodyStyles.includes(body) ? 1 : 0;
}

function yearScore(year: number, p: PreferenceProfile) {
  if (p.minYear == null && p.maxYear == null) return null;
  const min = p.minYear ?? 0;
  const max = p.maxYear ?? 9999;
  if (year >= min && year <= max) return 1;
  const off = year < min ? min - year : year - max;
  return clamp(1 - off / 4);
}

function mileageScore(km: number, p: PreferenceProfile) {
  if (p.maxMileage == null) return null;
  if (km <= p.maxMileage) return 1;
  return clamp(1 - (km - p.maxMileage) / (p.maxMileage * 0.5 || 1));
}

function locationScore(c: ScoringCandidate, p: PreferenceProfile) {
  if (p.latitude == null || p.longitude == null || c.latitude == null || c.longitude == null) return null;
  const radius = p.radiusKm ?? 100;
  const d = distanceKm(p.latitude, p.longitude, c.latitude, c.longitude);
  if (d <= radius) return 1;
  return clamp(1 - (d - radius) / radius);
}

function similarityScore(c: ScoringCandidate, p: PreferenceProfile) {
  if (!p.liked.length) return null;
  let best = 0;
  for (const l of p.liked) {
    let s = 0;
    if (l.make === c.make) s += 0.5;
    if (l.bodyStyle && l.bodyStyle === c.bodyStyle) s += 0.3;
    if (Math.abs(l.price - c.price) <= l.price * 0.25) s += 0.2;
    best = Math.max(best, s);
  }
  return best;
}

/** Recency + popularity prior used for cold start and as a tie-breaker. */
export function coldStartScore(c: ScoringCandidate, now = Date.now()) {
  const ageDays = c.publishedAt ? (now - c.publishedAt.getTime()) / 86_400_000 : 60;
  const recency = clamp(1 - ageDays / 60);
  const popularity = clamp(Math.log1p(c.saveCount) / Math.log1p(20));
  return 0.6 * recency + 0.4 * popularity;
}

export type ScoreBreakdown = { total: number; parts: Partial<Record<keyof RecommendationWeights, number>> };

export function scoreVehicle(
  c: ScoringCandidate,
  p: PreferenceProfile,
  weights: RecommendationWeights = DEFAULT_WEIGHTS,
  now = Date.now(),
): ScoreBreakdown {
  const w = normalizeWeights(weights);
  const parts: ScoreBreakdown["parts"] = {};
  const raw: [keyof RecommendationWeights, number | null][] = [
    ["budget", budgetScore(c.price, p)],
    ["brand", brandScore(c.make, p)],
    ["bodyStyle", bodyScore(c.bodyStyle, p)],
    ["year", yearScore(c.year, p)],
    ["mileage", mileageScore(c.mileage, p)],
    ["location", locationScore(c, p)],
    ["similarity", similarityScore(c, p)],
  ];

  let weighted = 0;
  let weightUsed = 0;
  for (const [key, value] of raw) {
    if (value === null) continue;
    parts[key] = value;
    weighted += value * w[key];
    weightUsed += w[key];
  }

  const prior = coldStartScore(c, now);
  // With no signals at all we rank purely on the prior; otherwise the prior
  // only nudges ties (10%).
  let total = weightUsed > 0 ? 0.9 * (weighted / weightUsed) + 0.1 * prior : prior;

  // Gentle penalty for makes the user keeps passing on.
  const passes = p.passedMakes.get(c.make) ?? 0;
  if (passes >= 3) total *= Math.max(0.6, 1 - passes * 0.05);

  return { total, parts };
}

export function rankVehicles<T extends ScoringCandidate>(
  candidates: T[],
  profile: PreferenceProfile,
  weights?: RecommendationWeights,
): T[] {
  const now = Date.now();
  return candidates
    .map((c) => ({ c, s: scoreVehicle(c, profile, weights, now).total }))
    .sort((a, b) => b.s - a.s || a.c.id.localeCompare(b.c.id))
    .map((x) => x.c);
}
