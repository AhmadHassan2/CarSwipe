/**
 * Deterministic pseudo-random listing views for the last `days` days, so the
 * seller dashboard chart has a realistic shape on a fresh database. Newer and
 * pricier/sportier listings get a little more traffic, with a weekend bump.
 */
export function demoViewTimestamps(seed: string, listedDaysAgo: number, now: number, days = 14): Date[] {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const out: Date[] = [];
  const window = Math.min(days, listedDaysAgo + 1);
  for (let d = 0; d < window; d++) {
    const day = new Date(now - d * 86_400_000);
    const weekend = day.getDay() === 0 || day.getDay() === 6 ? 1.5 : 1;
    const freshness = d === listedDaysAgo ? 2 : 1; // spike on listing day
    const count = Math.floor(rand() * 5 * weekend * freshness);
    for (let i = 0; i < count; i++) out.push(new Date(day.getTime() - Math.floor(rand() * 14 * 3_600_000)));
  }
  return out;
}
