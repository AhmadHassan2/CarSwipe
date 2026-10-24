import type { SellerType } from "../../src/generated/prisma/enums";

export type SeedSeller = {
  key: string;
  name: string;
  email: string;
  sellerType: SellerType;
  dealerName?: string;
  city: string;
};

export const DEMO_PASSWORD = "CarSwipe123";

export const SELLERS: SeedSeller[] = [
  { key: "northline", name: "Northline Auto Group", email: "sales@northline.demo", sellerType: "DEALER", dealerName: "Northline Auto Group", city: "Vaughan" },
  { key: "lakeshore", name: "Lakeshore Motors", email: "hello@lakeshore.demo", sellerType: "DEALER", dealerName: "Lakeshore Motors", city: "Oakville" },
  { key: "peel", name: "Peel Premium Auto", email: "info@peelpremium.demo", sellerType: "DEALER", dealerName: "Peel Premium Auto", city: "Brampton" },
  { key: "steeltown", name: "Steeltown Auto Sales", email: "team@steeltown.demo", sellerType: "DEALER", dealerName: "Steeltown Auto Sales", city: "Hamilton" },
  { key: "priya", name: "Priya Sharma", email: "priya@carswipe.dev", sellerType: "PRIVATE", city: "Mississauga" },
  { key: "marcus", name: "Marcus Chen", email: "marcus@carswipe.dev", sellerType: "PRIVATE", city: "Toronto" },
  { key: "danielle", name: "Danielle Okafor", email: "danielle@carswipe.dev", sellerType: "PRIVATE", city: "Markham" },
  { key: "liam", name: "Liam Tremblay", email: "liam@carswipe.dev", sellerType: "PRIVATE", city: "Burlington" },
];

export const DEMO_BUYER = {
  name: "Alex Rivera",
  email: "demo@carswipe.dev",
  city: "Toronto",
};
