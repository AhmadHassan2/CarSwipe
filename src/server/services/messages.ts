import "server-only";
import { db } from "@/server/db";
import { AppError } from "@/server/errors";
import { createNotification } from "./notifications";

const MAX_LEN = 2000;

function cleanContent(content: string) {
  const text = content.replace(/\r\n/g, "\n").trim();
  if (!text) throw new AppError("INVALID", "Message can't be empty");
  if (text.length > MAX_LEN) throw new AppError("INVALID", `Messages are limited to ${MAX_LEN} characters`);
  return text;
}

/** Finds or creates the buyer's conversation about a vehicle and sends the first message. */
export async function contactSeller(buyerId: string, vehicleId: string, content: string) {
  const text = cleanContent(content);
  const vehicle = await db.vehicle.findUnique({
    where: { id: vehicleId },
    select: { id: true, sellerId: true, status: true, year: true, make: true, model: true },
  });
  if (!vehicle || vehicle.status === "DRAFT" || vehicle.status === "REMOVED") throw new AppError("NOT_FOUND", "Listing not found");
  if (vehicle.sellerId === buyerId) throw new AppError("INVALID", "You can't message yourself about your own listing");

  const buyer = await db.user.findUnique({ where: { id: buyerId }, select: { name: true } });
  const { conversation, isNew } = await db.$transaction(async (tx) => {
    const existing = await tx.conversation.findUnique({ where: { vehicleId_buyerId: { vehicleId, buyerId } } });
    const now = new Date();
    const conversation = existing
      ? await tx.conversation.update({ where: { id: existing.id }, data: { lastMessageAt: now } })
      : await tx.conversation.create({ data: { vehicleId, buyerId, sellerId: vehicle.sellerId, lastMessageAt: now } });
    await tx.message.create({ data: { conversationId: conversation.id, senderId: buyerId, content: text } });
    return { conversation, isNew: !existing };
  });

  const prefs = await db.userPreferences.findUnique({ where: { userId: vehicle.sellerId }, select: { notifyInquiries: true } });
  if (prefs?.notifyInquiries !== false) {
    await createNotification({
      userId: vehicle.sellerId,
      type: isNew ? "INQUIRY" : "MESSAGE",
      title: isNew ? "New inquiry" : "New message",
      content: `${buyer?.name ?? "A buyer"} about your ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      href: `/messages/${conversation.id}`,
    });
  }
  return conversation;
}

async function getMembership(userId: string, conversationId: string) {
  const convo = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, buyerId: true, sellerId: true },
  });
  // Same error for "missing" and "not yours" so ids can't be probed.
  if (!convo || (convo.buyerId !== userId && convo.sellerId !== userId)) {
    throw new AppError("NOT_FOUND", "Conversation not found");
  }
  return convo;
}

export async function sendMessage(userId: string, conversationId: string, content: string) {
  const text = cleanContent(content);
  const convo = await getMembership(userId, conversationId);
  const recipientId = convo.buyerId === userId ? convo.sellerId : convo.buyerId;
  const message = await db.$transaction(async (tx) => {
    const m = await tx.message.create({ data: { conversationId, senderId: userId, content: text } });
    await tx.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: m.createdAt } });
    return m;
  });

  const [sender, prefs] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { name: true } }),
    db.userPreferences.findUnique({ where: { userId: recipientId }, select: { notifyMessages: true } }),
  ]);
  if (prefs?.notifyMessages !== false) {
    await createNotification({
      userId: recipientId,
      type: "MESSAGE",
      title: `New message from ${sender?.name ?? "a user"}`,
      content: text.slice(0, 140),
      href: `/messages/${conversationId}`,
    });
  }
  return message;
}

export async function listConversations(userId: string) {
  const convos = await db.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    orderBy: { lastMessageAt: "desc" },
    include: {
      vehicle: {
        select: { id: true, year: true, make: true, model: true, price: true, status: true, images: { orderBy: { position: "asc" }, take: 1, select: { imageUrl: true } } },
      },
      buyer: { select: { id: true, name: true, image: true } },
      seller: { select: { id: true, name: true, image: true, dealerName: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { content: true, senderId: true, createdAt: true } },
    },
  });
  const unread = await db.message.groupBy({
    by: ["conversationId"],
    where: { conversationId: { in: convos.map((c) => c.id) }, senderId: { not: userId }, readAt: null },
    _count: { _all: true },
  });
  const unreadMap = new Map(unread.map((u) => [u.conversationId, u._count._all]));
  return convos.map((c) => {
    const isBuyer = c.buyerId === userId;
    const other = isBuyer
      ? { id: c.seller.id, name: c.seller.dealerName ?? c.seller.name, image: c.seller.image }
      : { id: c.buyer.id, name: c.buyer.name, image: c.buyer.image };
    return {
      id: c.id,
      role: isBuyer ? ("buyer" as const) : ("seller" as const),
      vehicle: c.vehicle,
      other,
      lastMessage: c.messages[0] ?? null,
      lastMessageAt: c.lastMessageAt,
      unread: unreadMap.get(c.id) ?? 0,
    };
  });
}
export type ConversationSummary = Awaited<ReturnType<typeof listConversations>>[number];

export async function getConversation(userId: string, conversationId: string) {
  await getMembership(userId, conversationId);
  const convo = await db.conversation.findUniqueOrThrow({
    where: { id: conversationId },
    include: {
      vehicle: {
        select: { id: true, year: true, make: true, model: true, trim: true, price: true, status: true, location: true, images: { orderBy: { position: "asc" }, take: 1, select: { imageUrl: true } } },
      },
      buyer: { select: { id: true, name: true, image: true } },
      seller: { select: { id: true, name: true, image: true, dealerName: true } },
    },
  });
  return convo;
}

export async function getMessages(userId: string, conversationId: string, after?: Date) {
  await getMembership(userId, conversationId);
  return db.message.findMany({
    where: { conversationId, ...(after ? { createdAt: { gt: after } } : {}) },
    orderBy: { createdAt: "asc" },
    take: 500,
    select: { id: true, senderId: true, content: true, createdAt: true, readAt: true },
  });
}

export async function markConversationRead(userId: string, conversationId: string) {
  await getMembership(userId, conversationId);
  await db.message.updateMany({
    where: { conversationId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });
  await db.notification.updateMany({
    where: { userId, readAt: null, href: `/messages/${conversationId}` },
    data: { readAt: new Date() },
  });
}

export async function unreadMessageCount(userId: string) {
  return db.message.count({
    where: {
      readAt: null,
      senderId: { not: userId },
      conversation: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    },
  });
}

/** Timestamp of the newest message from `userId` that the other side has read. */
export async function getReadUpTo(userId: string, conversationId: string) {
  const m = await db.message.findFirst({
    where: { conversationId, senderId: userId, readAt: { not: null } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  return m?.createdAt ?? null;
}
