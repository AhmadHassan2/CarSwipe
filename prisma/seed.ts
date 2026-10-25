import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { CITIES } from "../src/lib/locations";
import { DEMO_BUYER, DEMO_PASSWORD, REVIEWERS, REVIEWS, SELLERS } from "./seed-data/sellers";
import { VEHICLES } from "./seed-data/vehicles";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const DAY = 86_400_000;

function photoUrl(id: string, crop?: { x: number; y: number; z: number }) {
  const base = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&h=1200&q=80`;
  return crop ? `${base}&crop=focalpoint&fp-x=${crop.x}&fp-y=${crop.y}&fp-z=${crop.z}` : base;
}

// A single stock photo becomes a 3-image gallery: the full shot plus two
// zoomed crops of the same car, so the carousel has real content to show.
function galleryFor(photos: string[]) {
  if (photos.length > 1) return photos.map((id) => ({ url: photoUrl(id), detail: false }));
  const [id] = photos;
  return [
    { url: photoUrl(id!), detail: false },
    { url: photoUrl(id!, { x: 0.32, y: 0.58, z: 1.8 }), detail: true },
    { url: photoUrl(id!, { x: 0.68, y: 0.58, z: 1.8 }), detail: true },
  ];
}

function cityCoords(name: string) {
  const city = CITIES.find((c) => c.name === name);
  if (!city) throw new Error(`Unknown city ${name}`);
  return city;
}

async function main() {
  console.log("Resetting demo data…");
  // Only demo rows are removed so real accounts survive re-seeding.
  await db.vehicle.deleteMany({ where: { isDemo: true } });
  await db.user.deleteMany({
    where: { email: { in: [...SELLERS.map((s) => s.email), ...REVIEWERS.map((r) => r.email), DEMO_BUYER.email] } },
  });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const sellerIds = new Map<string, { id: string; city: string }>();
  for (const s of SELLERS) {
    const user = await db.user.create({
      data: {
        name: s.name,
        email: s.email,
        passwordHash,
        sellerType: s.sellerType,
        dealerName: s.dealerName,
        emailVerified: new Date(),
      },
    });
    sellerIds.set(s.key, { id: user.id, city: s.city });
  }

  const buyerCity = cityCoords(DEMO_BUYER.city);
  const buyer = await db.user.create({
    data: {
      name: DEMO_BUYER.name,
      email: DEMO_BUYER.email,
      passwordHash,
      emailVerified: new Date(),
      preferences: {
        create: {
          maxPrice: 80000,
          preferredMakes: ["BMW", "Porsche", "Tesla"],
          bodyStyles: ["COUPE", "SEDAN"],
          minYear: 2017,
          maxMileage: 100000,
          location: `${buyerCity.name}, ${buyerCity.province}`,
          latitude: buyerCity.lat,
          longitude: buyerCity.lng,
          radius: 100,
          onboardedAt: new Date(),
        },
      },
    },
  });

  console.log(`Creating ${VEHICLES.length} listings…`);
  const now = Date.now();
  for (const v of VEHICLES) {
    const seller = sellerIds.get(v.seller);
    if (!seller) throw new Error(`Unknown seller ${v.seller}`);
    const city = cityCoords(seller.city);
    const status = v.status ?? "ACTIVE";
    const listedAt = new Date(now - v.daysAgo * DAY);
    const title = `${v.year} ${v.make} ${v.model}`;

    await db.vehicle.create({
      data: {
        sellerId: seller.id,
        make: v.make,
        model: v.model,
        year: v.year,
        trim: v.trim,
        price: v.price,
        mileage: v.mileage,
        description: v.description,
        condition: v.condition ?? "USED",
        location: `${city.name}, ${city.province}`,
        latitude: city.lat,
        longitude: city.lng,
        transmission: v.transmission,
        fuelType: v.fuelType,
        drivetrain: v.drivetrain,
        bodyStyle: v.bodyStyle,
        engine: v.engine,
        horsepower: v.horsepower,
        exteriorColour: v.exteriorColour,
        interiorColour: v.interiorColour,
        owners: v.owners,
        features: v.features ?? [],
        history: v.history,
        status,
        isDemo: true,
        publishedAt: listedAt,
        soldAt: status === "SOLD" ? new Date(listedAt.getTime() + 7 * DAY) : null,
        createdAt: listedAt,
        images: {
          create: galleryFor(v.photos).map((img, position) => ({
            imageUrl: img.url,
            position,
            alt: img.detail ? `${title} detail` : title,
          })),
        },
      },
    });
  }

  console.log("Adding seller reviews…");
  const reviewerIds: string[] = [];
  for (const r of REVIEWERS) {
    const u = await db.user.create({ data: { name: r.name, email: r.email, passwordHash, emailVerified: new Date() } });
    reviewerIds.push(u.id);
  }
  for (const [key, reviews] of Object.entries(REVIEWS)) {
    const seller = sellerIds.get(key);
    if (!seller) throw new Error(`Unknown seller ${key}`);
    await db.sellerReview.createMany({
      data: reviews.map(([idx, rating, comment, days]) => ({
        sellerId: seller.id,
        reviewerId: reviewerIds[idx]!,
        rating,
        comment,
        createdAt: new Date(now - days * DAY),
      })),
    });
  }

  console.log("Done.");
  console.log(`Demo buyer: ${buyer.email} / ${DEMO_PASSWORD}`);
  console.log(`Demo sellers: ${SELLERS.map((s) => s.email).join(", ")} (same password)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
