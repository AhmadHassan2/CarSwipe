import { NextResponse } from "next/server";
import { z } from "zod";
import { readJson, requireUserId, route } from "@/server/api";
import { listNotifications, markNotificationsRead } from "@/server/services/notifications";

export const GET = route(async () => {
  const userId = await requireUserId();
  return NextResponse.json({ notifications: await listNotifications(userId) });
});

const patchSchema = z.object({ ids: z.array(z.string().max(40)).max(100).optional() });

export const PATCH = route(async (req: Request) => {
  const userId = await requireUserId();
  const { ids } = patchSchema.parse(await readJson(req));
  await markNotificationsRead(userId, ids);
  return NextResponse.json({ ok: true });
});
