import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { listConversations } from "@/server/services/messages";
import { InboxShell } from "@/components/messages/inbox-shell";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const userId = (await auth())?.user?.id;
  if (!userId) redirect("/login?callbackUrl=/messages");
  const conversations = await listConversations(userId);
  return <InboxShell conversations={conversations} viewerId={userId} />;
}
