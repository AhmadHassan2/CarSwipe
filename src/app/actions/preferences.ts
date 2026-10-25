"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth";
import { preferencesSchema, type PreferencesInput } from "@/features/preferences/schema";
import { markOnboarded, savePreferences } from "@/server/services/preferences";

export async function savePreferencesAction(input: PreferencesInput, opts: { onboarding?: boolean } = {}) {
  const userId = (await auth())?.user?.id;
  if (!userId) return { ok: false as const, error: "Please sign in again" };
  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Check your answers" };
  await savePreferences(userId, parsed.data, { onboarded: opts.onboarding });
  revalidatePath("/swipe");
  return { ok: true as const };
}

export async function skipOnboardingAction() {
  const userId = (await auth())?.user?.id;
  if (!userId) return { ok: false as const };
  await markOnboarded(userId);
  return { ok: true as const };
}
