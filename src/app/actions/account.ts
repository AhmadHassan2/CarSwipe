"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth, signOut } from "@/server/auth";
import { AppError } from "@/server/errors";
import { limit, rateLimitsEnabled } from "@/server/rate-limit";
import { changePasswordSchema } from "@/features/auth/schemas";
import { changePassword, deleteAccount, updateNotificationPrefs, updateProfile, updateThemePref } from "@/server/services/account";

type Result = { ok: true } | { ok: false; error: string };

async function withUser(fn: (userId: string) => Promise<unknown>): Promise<Result> {
  const userId = (await auth())?.user?.id;
  if (!userId) return { ok: false, error: "Please sign in again" };
  try {
    await fn(userId);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    if (err instanceof AppError) return { ok: false, error: err.message };
    if (err instanceof z.ZodError) return { ok: false, error: err.issues[0]?.message ?? "Check your details" };
    console.error("[account] action failed:", err instanceof Error ? err.message : err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: z.string().trim().max(30).regex(/^[0-9+()\-.\s]*$/, "Use digits, spaces and + ( ) - only").optional().nullable(),
  sellerType: z.enum(["PRIVATE", "DEALER"]),
  dealerName: z.string().trim().max(120).optional().nullable(),
});

export async function updateProfileAction(input: z.input<typeof profileSchema>) {
  return withUser((id) => updateProfile(id, profileSchema.parse(input)));
}

export async function updateNotificationsAction(input: { notifyMessages: boolean; notifyInquiries: boolean }) {
  const data = z.object({ notifyMessages: z.boolean(), notifyInquiries: z.boolean() }).parse(input);
  return withUser((id) => updateNotificationPrefs(id, data));
}

export async function updateThemeAction(theme: string) {
  const t = z.enum(["LIGHT", "DARK", "SYSTEM"]).parse(theme);
  return withUser((id) => updateThemePref(id, t));
}

export async function changePasswordAction(input: { currentPassword: string; newPassword: string; confirmPassword: string }) {
  return withUser(async (id) => {
    if (rateLimitsEnabled() && !limit("password", id).ok) throw new AppError("RATE_LIMITED", "Too many attempts. Try again in a few minutes.");
    const data = changePasswordSchema.parse(input);
    await changePassword(id, data.currentPassword, data.newPassword);
  });
}

export async function deleteAccountAction(password: string) {
  const res = await withUser(async (id) => {
    if (rateLimitsEnabled() && !limit("password", id).ok) throw new AppError("RATE_LIMITED", "Too many attempts. Try again in a few minutes.");
    await deleteAccount(id, password);
  });
  if (res.ok) await signOut({ redirectTo: "/" });
  return res;
}
