import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { getPreferences } from "@/server/services/preferences";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = { title: "Set up your feed" };

export default async function OnboardingPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login?callbackUrl=/onboarding");
  const prefs = await getPreferences(userId);
  if (prefs?.onboardedAt) redirect("/swipe");
  return <OnboardingFlow name={session.user?.name ?? null} />;
}
