import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, googleEnabled } from "@/server/auth";
import { LoginForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { callbackUrl } = await searchParams;
  const target = typeof callbackUrl === "string" ? callbackUrl : undefined;
  if ((await auth())?.user) redirect(target?.startsWith("/") && !target.startsWith("//") ? target : "/swipe");
  return <LoginForm callbackUrl={target} googleEnabled={googleEnabled} notice={target ? "Sign in to continue." : undefined} />;
}
