import { describe, expect, it } from "vitest";
import { countActiveFilters, filtersToSearchParams, parseFilters } from "@/features/vehicles/filters";

describe("vehicle filters", () => {
  it("round-trips through URL search params", () => {
    const f = { q: "bmw m4", makes: ["BMW", "Audi"], bodyStyles: ["COUPE" as const], maxPrice: 80000, sort: "price_asc" as const };
    expect(parseFilters(filtersToSearchParams(f))).toEqual(f);
  });

  it("drops unknown enum values and garbage numbers instead of throwing", () => {
    const f = parseFilters(new URLSearchParams("bodyStyles=SUV,SPACESHIP&maxPrice=abc&sort=nope&minYear=2018"));
    expect(f).toEqual({ bodyStyles: ["SUV"], minYear: 2018 });
  });

  it("counts filters but not search, sort, page or radius", () => {
    expect(countActiveFilters({ q: "x", sort: "newest", page: 2, radius: 50, makes: ["BMW"], maxPrice: 1 })).toBe(2);
  });
});

import { safeRedirect } from "@/lib/safe-redirect";

describe("safeRedirect", () => {
  it("keeps same-site paths, including from absolute callback URLs", () => {
    expect(safeRedirect("/saved?sort=price_asc")).toBe("/saved?sort=price_asc");
    expect(safeRedirect("http://localhost:3000/onboarding")).toBe("/onboarding");
  });
  it("never redirects off-site or back to auth pages", () => {
    expect(safeRedirect("https://evil.example/phish")).toBe("/phish");
    expect(safeRedirect("//evil.example")).toBe("/swipe");
    expect(safeRedirect("/\\evil.example")).toBe("/swipe");
    expect(safeRedirect("javascript:alert(1)")).toBe("/swipe");
    expect(safeRedirect("/login")).toBe("/swipe");
    expect(safeRedirect(undefined)).toBe("/swipe");
  });
});
