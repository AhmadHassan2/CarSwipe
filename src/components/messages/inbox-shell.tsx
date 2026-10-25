import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { ConversationList } from "./conversation-list";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { ConversationSummary } from "@/server/services/messages";
import { cn } from "@/lib/utils";

/** Two-pane inbox on desktop; on mobile only one pane shows (list on /messages, thread on /messages/[id]). */
export function InboxShell({
  conversations,
  activeId,
  viewerId,
  children,
}: {
  conversations: ConversationSummary[];
  activeId?: string;
  viewerId: string;
  children?: React.ReactNode;
}) {
  if (!conversations.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">Messages</h1>
        <EmptyState
          icon={MessageCircle}
          title="No conversations yet"
          description="When you message a seller, or a buyer asks about your car, the conversation shows up here."
          action={<Button asChild><Link href="/browse">Find a car</Link></Button>}
        />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-7xl px-0 sm:px-6 sm:py-6">
      <div className="grid h-[calc(100dvh-8rem)] overflow-hidden border-y bg-card sm:h-[calc(100dvh-7rem)] sm:rounded-2xl sm:border md:grid-cols-[20rem_1fr] md:h-[calc(100dvh-8rem)]">
        <aside className={cn("min-h-0 overflow-y-auto border-r", activeId && "hidden md:block")}>
          <h1 className="sticky top-0 z-10 border-b bg-card px-4 py-3 text-lg font-semibold">Messages</h1>
          <ConversationList conversations={conversations} activeId={activeId} viewerId={viewerId} />
        </aside>
        <section className={cn("min-h-0 flex-col", activeId ? "flex" : "hidden md:flex")}>
          {children ?? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <MessageCircle className="size-8" />
              <p className="text-sm">Pick a conversation to read it.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
