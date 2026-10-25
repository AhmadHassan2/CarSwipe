import { describe, expect, it } from "vitest";
import { listingSchema } from "@/features/vehicles/listing-schema";

const base = {
  make: "Toyota", model: "Corolla", year: "2020", price: "$23,500", mileage: "48,000", location: "Toronto, ON",
  description: "One owner, all service at Toyota, winter tires included.", bodyStyle: "SEDAN", transmission: "MANUAL",
  fuelType: "GASOLINE", drivetrain: "", vin: "", condition: "USED", features: [], images: [],
};

describe("listingSchema", () => {
  it("accepts form strings and normalises numbers", () => {
    const r = listingSchema.parse(base);
    expect(r.price).toBe(23500);
    expect(r.mileage).toBe(48000);
    expect(r.year).toBe(2020);
  });

  it("treats an unselected optional drivetrain and empty VIN as missing", () => {
    const r = listingSchema.parse(base);
    expect(r.drivetrain).toBeUndefined();
    expect(r.vin).toBeUndefined();
  });

  it("uses friendly messages for unselected required choices", () => {
    const r = listingSchema.safeParse({ ...base, bodyStyle: "", transmission: "", fuelType: "" });
    expect(r.success).toBe(false);
    const messages = r.error!.issues.map((i) => i.message);
    expect(messages).toEqual(expect.arrayContaining(["Choose a body style", "Choose a transmission", "Choose a fuel type"]));
    expect(messages.join(" ")).not.toMatch(/expected one of/i);
  });

  it("rejects malformed VINs and uppercases valid ones", () => {
    expect(listingSchema.safeParse({ ...base, vin: "BADVIN" }).success).toBe(false);
    expect(listingSchema.safeParse({ ...base, vin: "1HGCM82633A00435O" }).success).toBe(false); // contains O
    expect(listingSchema.parse({ ...base, vin: "1hgcm82633a004352" }).vin).toBe("1HGCM82633A004352");
  });

  it("enforces sane price, year and description bounds", () => {
    expect(listingSchema.safeParse({ ...base, price: "12" }).success).toBe(false);
    expect(listingSchema.safeParse({ ...base, year: "1850" }).success).toBe(false);
    expect(listingSchema.safeParse({ ...base, description: "too short" }).success).toBe(false);
  });
});
