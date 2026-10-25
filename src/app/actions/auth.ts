"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/server/auth";
import { db } from "@/server/db";
import { hashPassword } from "@/server/password";
import { limit, rateLimitsEnabled } from "@/server/rate-limit";
import { loginSchema, signupSchema } from "@/features/auth/schemas";

export type AuthState = { error?: string; fieldErrors?: Record<string, string>; values?: { name?: string; email?: string } };

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

/** Only same-site relative paths are allowed as post-login destinations. */
function safeRedirect(target: unknown) {
  return typeof target === "string" && target.startsWith("/") && !target.startsWith("//") ? target : "/swipe";
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  const values = { email: String(formData.get("email") ?? "") };
  if (!parsed.success) return { error: "Enter your email and password", values };
  try {
    await signIn("credentials", { ...parsed.data, redirectTo: safeRedirect(formData.get("callbackUrl")) });
  } catch (err) {
    if (err instanceof AuthError) {
      if ((err as { code?: string }).code === "rate_limited") return { error: "Too many attempts. Please wait a few minutes and try again.", values };
      return { error: "Incorrect email or password", values };
    }
    throw err; // redirects must propagate
  }
  return {};
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const values = { name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? "") };
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { fieldErrors, values };
  }

  if (rateLimitsEnabled()) {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (!limit("signup", ip).ok) return { error: "Too many sign-ups from your network. Try again later.", values };
  }

  const { name, email, password } = parsed.data;
  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { fieldErrors: { email: "An account with this email already exists" }, values };

  await db.user.create({ data: { name, email, passwordHash: await hashPassword(password) } });
  try {
    await signIn("credentials", { email, password, redirectTo: "/onboarding" });
  } catch (err) {
    if (err instanceof AuthError) return { error: "Account created. Please sign in.", values };
    throw err;
  }
  return {};
}

export async function googleSignInAction(formData: FormData) {
  await signIn("google", { redirectTo: safeRedirect(formData.get("callbackUrl")) });
}
