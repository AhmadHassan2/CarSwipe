import { NextResponse } from "next/server";
import { requireUserId, route } from "@/server/api";
import { unreadMessageCount } from "@/server/services/messages";
import { unreadNotificationCount } from "@/server/services/notifications";

export const GET = route(async () => {
  const userId = await requireUserId();
  const [messages, notifications] = await Promise.all([unreadMessageCount(userId), unreadNotificationCount(userId)]);
  return NextResponse.json({ messages, notifications });
});
