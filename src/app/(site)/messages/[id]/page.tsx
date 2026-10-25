import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/server/auth";
import { AppError } from "@/server/errors";
import { getConversation, getMessages, listConversations, markConversationRead } from "@/server/services/messages";
import { InboxShell } from "@/components/messages/inbox-shell";
import { Thread } from "@/components/messages/thread";
import { VehicleImage } from "@/components/vehicles/vehicle-image";
import { formatPrice, vehicleTitle } from "@/lib/format";

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationPage({ params }: PageProps<"/messages/[id]">) {
  const userId = (await auth())?.user?.id;
  const { id } = await params;
  if (!userId) redirect(`/login?callbackUrl=/messages/${id}`);

  let convo;
  try {
    convo = await getConversation(userId, id);
  } catch (err) {
    if (err instanceof AppError) notFound();
    throw err;
  }
  await markConversationRead(userId, id);
  const [messages, conversations] = await Promise.all([getMessages(userId, id), listConversations(userId)]);
  const other = convo.buyerId === userId ? { name: convo.seller.dealerName ?? convo.seller.name } : { name: convo.buyer.name };
  const v = convo.vehicle;

  return (
    <InboxShell conversations={conversations} activeId={id} viewerId={userId}>
      <header className="flex items-center gap-3 border-b px-3 py-2.5">
        <Link href="/messages" className="rounded-full p-2 hover:bg-muted md:hidden" aria-label="Back to messages"><ArrowLeft className="size-5" /></Link>
        <Link href={`/vehicles/${v.id}`} className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
            <VehicleImage src={v.images[0]?.imageUrl} alt="" sizes="44px" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{other.name ?? "CarSwipe user"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {vehicleTitle(v)} · {formatPrice(v.price)}{v.status !== "ACTIVE" && ` · ${v.status === "SOLD" ? "Sold" : v.status === "PENDING" ? "Pending" : "Unavailable"}`}
            </p>
          </div>
        </Link>
      </header>
      <Thread
        key={id}
        conversationId={id}
        viewerId={userId}
        closed={v.status === "REMOVED"}
        initial={messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString(), readAt: m.readAt?.toISOString() ?? null }))}
      />
    </InboxShell>
  );
}
