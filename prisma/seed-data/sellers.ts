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

/** Demo buyers who leave seller reviews. */
export const REVIEWERS = [
  { name: "Jordan Lee", email: "jordan@reviewers.demo" },
  { name: "Sofia Martins", email: "sofia@reviewers.demo" },
  { name: "Omar Haddad", email: "omar@reviewers.demo" },
  { name: "Emily Nguyen", email: "emily@reviewers.demo" },
  { name: "Raj Patel", email: "raj@reviewers.demo" },
  { name: "Hannah Brooks", email: "hannah@reviewers.demo" },
];

/** Per-seller reviews: [reviewer index, stars, comment, days ago]. */
export const REVIEWS: Record<string, [number, number, string | null, number][]> = {
  northline: [
    [0, 5, "Car was exactly as described and the paperwork took twenty minutes. No pressure at all.", 12],
    [1, 5, "Answered every question over chat before I even visited. Would buy here again.", 30],
    [2, 4, "Good price and clean car. Delivery took a couple of days longer than promised.", 45],
    [3, 5, null, 60],
    [4, 4, "Smooth trade-in, fair offer on my old car.", 90],
  ],
  lakeshore: [
    [1, 5, "Detailed walkaround video before I drove out. Very transparent.", 8],
    [3, 5, "Professional from start to finish.", 26],
    [5, 4, "Great selection, a little firm on price.", 51],
  ],
  peel: [
    [0, 4, "Car was great. Had to follow up twice for the second key.", 15],
    [2, 3, "Fine overall, but the listing photos made the interior look better than it was.", 38],
    [4, 4, null, 70],
    [5, 3, "Slow to reply on weekends.", 95],
  ],
  steeltown: [
    [2, 4, "Honest about the truck's issues and priced it accordingly.", 20],
    [3, 4, "No-nonsense dealer. Got what I paid for.", 47],
    [5, 5, "Helped me sort out financing fast.", 80],
  ],
  priya: [
    [4, 5, "Priya had every service record in a binder. Easiest private purchase I've made.", 18],
    [0, 5, null, 64],
  ],
  marcus: [
    [1, 5, "Knows his cars and let me take it to my mechanic first.", 10],
    [2, 4, "Good communication, car was clean.", 33],
    [5, 5, "Super easy to deal with.", 58],
  ],
  danielle: [
    [3, 5, "Very responsive and flexible about viewing times.", 22],
  ],
  liam: [
    [0, 4, "Car was as advertised. Took a few days to hear back.", 40],
    [4, 5, "Great enthusiast owner, meticulous with maintenance.", 75],
  ],
};
