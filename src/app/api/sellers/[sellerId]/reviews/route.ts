import { NextResponse } from "next/server";
import { z } from "zod";
import { enforceLimit, readJson, requireUserId, route } from "@/server/api";
import { deleteReview, getRatingSummary, upsertReview } from "@/server/services/reviews";

type Ctx = { params: Promise<{ sellerId: string }> };

const bodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const PUT = route(async (req: Request, { params }: Ctx) => {
  const userId = await requireUserId();
  enforceLimit("review", userId);
  const { sellerId } = await params;
  const { rating, comment } = bodySchema.parse(await readJson(req));
  await upsertReview(userId, sellerId, rating, comment);
  return NextResponse.json({ ok: true, summary: await getRatingSummary(sellerId) });
});

export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  const userId = await requireUserId();
  const { sellerId } = await params;
  await deleteReview(userId, sellerId);
  return NextResponse.json({ ok: true, summary: await getRatingSummary(sellerId) });
});
