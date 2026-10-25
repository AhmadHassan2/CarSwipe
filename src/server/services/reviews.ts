import "server-only";
import { db } from "@/server/db";
import { AppError } from "@/server/errors";
import { createNotification } from "./notifications";

export type RatingSummary = { average: number; count: number };

export async function getRatingSummary(sellerId: string): Promise<RatingSummary> {
  const agg = await db.sellerReview.aggregate({ where: { sellerId }, _avg: { rating: true }, _count: { _all: true } });
  return { average: agg._avg.rating ?? 0, count: agg._count._all };
}

/** Batched summaries for lists of cards. */
export async function getRatingSummaries(sellerIds: string[]): Promise<Map<string, RatingSummary>> {
  const ids = [...new Set(sellerIds)];
  if (!ids.length) return new Map();
  const rows = await db.sellerReview.groupBy({ by: ["sellerId"], where: { sellerId: { in: ids } }, _avg: { rating: true }, _count: { _all: true } });
  return new Map(rows.map((r) => [r.sellerId, { average: r._avg.rating ?? 0, count: r._count._all }]));
}

export function listReviews(sellerId: string, take = 5) {
  return db.sellerReview.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, rating: true, comment: true, createdAt: true, reviewer: { select: { name: true, image: true } } },
  });
}
export type SellerReviewItem = Awaited<ReturnType<typeof listReviews>>[number];

/**
 * A buyer may review a seller once they've had a conversation with them.
 * Returns their existing review (for editing) when there is one.
 */
export async function getReviewEligibility(userId: string | null, sellerId: string) {
  if (!userId || userId === sellerId) return { canReview: false as const, existing: null };
  const [convo, existing] = await Promise.all([
    db.conversation.findFirst({ where: { buyerId: userId, sellerId }, select: { id: true } }),
    db.sellerReview.findUnique({ where: { sellerId_reviewerId: { sellerId, reviewerId: userId } }, select: { rating: true, comment: true } }),
  ]);
  return { canReview: Boolean(convo), existing };
}

export async function upsertReview(userId: string, sellerId: string, rating: number, comment: string | undefined) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new AppError("INVALID", "Choose between 1 and 5 stars");
  const text = comment?.trim().slice(0, 1000) || null;
  const { canReview, existing } = await getReviewEligibility(userId, sellerId);
  if (!canReview) throw new AppError("FORBIDDEN", "You can review a seller after messaging them about a listing");
  const review = await db.sellerReview.upsert({
    where: { sellerId_reviewerId: { sellerId, reviewerId: userId } },
    create: { sellerId, reviewerId: userId, rating, comment: text },
    update: { rating, comment: text },
  });
  if (!existing) {
    await createNotification({
      userId: sellerId,
      type: "SYSTEM",
      title: "New review",
      content: `You received a ${rating}-star review${text ? `: “${text.slice(0, 100)}”` : ""}`,
    });
  }
  return review;
}

export async function deleteReview(userId: string, sellerId: string) {
  await db.sellerReview.deleteMany({ where: { sellerId, reviewerId: userId } });
}
