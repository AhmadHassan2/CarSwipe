"use server";

import { auth } from "@/server/auth";
import { AppError } from "@/server/errors";
import { enforceLimit } from "@/server/api";
import { contactSeller, sendMessage } from "@/server/services/messages";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function run<T extends object>(fn: (userId: string) => Promise<T>): Promise<Result<T>> {
  const userId = (await auth())?.user?.id;
  if (!userId) return { ok: false, error: "Please sign in to message sellers" };
  try {
    enforceLimit("message", userId);
    return { ok: true, ...(await fn(userId)) };
  } catch (err) {
    if (err instanceof AppError) return { ok: false, error: err.message };
    console.error("[messages] action failed:", err instanceof Error ? err.message : err);
    return { ok: false, error: "Couldn't send your message. Please try again." };
  }
}

export async function contactSellerAction(vehicleId: string, content: string) {
  return run(async (userId) => ({ conversationId: (await contactSeller(userId, vehicleId, content)).id }));
}

export async function sendMessageAction(conversationId: string, content: string) {
  return run(async (userId) => {
    const m = await sendMessage(userId, conversationId, content);
    return { messageId: m.id };
  });
}
