import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, googleEnabled } from "@/server/auth";
import { LoginForm } from "@/components/auth/auth-form";
import { safeRedirect } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { callbackUrl } = await searchParams;
  const target = typeof callbackUrl === "string" && callbackUrl ? safeRedirect(callbackUrl) : undefined;
  if ((await auth())?.user) redirect(target ?? "/swipe");
  return <LoginForm callbackUrl={target} googleEnabled={googleEnabled} notice={target ? "Sign in to continue." : undefined} />;
}
