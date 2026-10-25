import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, googleEnabled } from "@/server/auth";
import { SignupForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage() {
  if ((await auth())?.user) redirect("/swipe");
  return <SignupForm googleEnabled={googleEnabled} />;
}
