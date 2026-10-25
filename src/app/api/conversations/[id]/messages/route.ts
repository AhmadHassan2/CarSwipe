import { NextResponse, type NextRequest } from "next/server";
import { requireUserId, route } from "@/server/api";
import { getMessages, getReadUpTo, markConversationRead } from "@/server/services/messages";

type Ctx = { params: Promise<{ id: string }> };

/** Polled by the open thread. `?after=<iso>` returns only newer messages and marks them read. */
export const GET = route(async (req: NextRequest, { params }: Ctx) => {
  const userId = await requireUserId();
  const { id } = await params;
  const afterParam = req.nextUrl.searchParams.get("after");
  const after = afterParam && !Number.isNaN(Date.parse(afterParam)) ? new Date(afterParam) : undefined;
  const messages = await getMessages(userId, id, after);
  if (messages.some((m) => m.senderId !== userId && !m.readAt)) await markConversationRead(userId, id);
  return NextResponse.json({ messages, readUpTo: await getReadUpTo(userId, id) });
});
