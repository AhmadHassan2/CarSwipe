import { describe, expect, it } from "vitest";
import { EMPTY_PROFILE, rankVehicles, scoreVehicle, type PreferenceProfile, type ScoringCandidate } from "@/features/recommendations/score";

const now = Date.now();
const car = (over: Partial<ScoringCandidate>): ScoringCandidate => ({
  id: "x", make: "Toyota", model: "Corolla", year: 2020, price: 25000, mileage: 50000, bodyStyle: "SEDAN",
  latitude: 43.65, longitude: -79.38, publishedAt: new Date(now), saveCount: 0, ...over,
});
const profile = (over: Partial<PreferenceProfile>): PreferenceProfile => ({ ...EMPTY_PROFILE, passedMakes: new Map(), ...over });

describe("recommendation scoring", () => {
  it("ranks in-budget, preferred-brand cars first", () => {
    const p = profile({ maxPrice: 30000, makes: ["BMW"] });
    const ranked = rankVehicles([car({ id: "over", price: 60000, make: "BMW" }), car({ id: "match", make: "BMW" }), car({ id: "other" })], p);
    expect(ranked[0]!.id).toBe("match");
  });

  it("falls off softly just over budget rather than cutting to zero", () => {
    const p = profile({ maxPrice: 30000 });
    const slightly = scoreVehicle(car({ price: 31000 }), p, undefined, now).parts.budget!;
    const way = scoreVehicle(car({ price: 40000 }), p, undefined, now).parts.budget!;
    expect(slightly).toBeGreaterThan(0.5);
    expect(way).toBe(0);
  });

  it("ignores preferences the user hasn't set", () => {
    const s = scoreVehicle(car({}), profile({ maxPrice: 30000 }), undefined, now);
    expect(Object.keys(s.parts)).toEqual(["budget"]);
  });

  it("uses recency and popularity when there are no signals (cold start)", () => {
    const fresh = car({ id: "fresh", saveCount: 10 });
    const stale = car({ id: "stale", publishedAt: new Date(now - 50 * 86_400_000) });
    expect(rankVehicles([stale, fresh], EMPTY_PROFILE)[0]!.id).toBe("fresh");
  });

  it("dampens makes the user keeps passing on", () => {
    const p = profile({ passedMakes: new Map([["Toyota", 6]]) });
    expect(scoreVehicle(car({}), p, undefined, now).total).toBeLessThan(scoreVehicle(car({}), EMPTY_PROFILE, undefined, now).total);
  });

  it("breaks ties deterministically by id", () => {
    const ranked = rankVehicles([car({ id: "b" }), car({ id: "a" })], EMPTY_PROFILE);
    expect(ranked.map((c) => c.id)).toEqual(["a", "b"]);
  });
});
