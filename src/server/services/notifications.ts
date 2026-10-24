import "server-only";
import { db } from "@/server/db";
import type { NotificationType } from "@/generated/prisma/enums";

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  href?: string;
}) {
  return db.notification.create({ data: input });
}

export function listNotifications(userId: string, take = 20) {
  return db.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take });
}

export function unreadNotificationCount(userId: string) {
  return db.notification.count({ where: { userId, readAt: null } });
}

export async function markNotificationsRead(userId: string, ids?: string[]) {
  await db.notification.updateMany({
    where: { userId, readAt: null, ...(ids?.length ? { id: { in: ids } } : {}) },
    data: { readAt: new Date() },
  });
}
