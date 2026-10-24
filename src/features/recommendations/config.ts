/**
 * Recommendation weights. They should sum to 1; `normalizeWeights` guards
 * against edits that don't. Override per-environment by passing custom
 * weights to `scoreVehicle` (e.g. for experiments).
 */
export const DEFAULT_WEIGHTS = {
  budget: 0.3,
  brand: 0.2,
  bodyStyle: 0.15,
  year: 0.1,
  mileage: 0.1,
  location: 0.1,
  similarity: 0.05,
} as const;

export type RecommendationWeights = Record<keyof typeof DEFAULT_WEIGHTS, number>;

export function normalizeWeights(w: RecommendationWeights): RecommendationWeights {
  const total = Object.values(w).reduce((a, b) => a + b, 0) || 1;
  return Object.fromEntries(Object.entries(w).map(([k, v]) => [k, v / total])) as RecommendationWeights;
}
