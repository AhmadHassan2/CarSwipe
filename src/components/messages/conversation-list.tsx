import Link from "next/link";
import { VehicleImage } from "@/components/vehicles/vehicle-image";
import { formatPrice, timeAgo, vehicleTitle } from "@/lib/format";
import type { ConversationSummary } from "@/server/services/messages";
import { cn } from "@/lib/utils";

export function ConversationList({ conversations, activeId, viewerId }: { conversations: ConversationSummary[]; activeId?: string; viewerId: string }) {
  return (
    <ul className="divide-y">
      {conversations.map((c) => {
        const preview = c.lastMessage ? `${c.lastMessage.senderId === viewerId ? "You: " : ""}${c.lastMessage.content}` : "No messages yet";
        return (
          <li key={c.id}>
            <Link
              href={`/messages/${c.id}`}
              aria-current={c.id === activeId ? "page" : undefined}
              className={cn("flex gap-3 p-4 transition-colors hover:bg-muted/60", c.id === activeId && "bg-muted")}
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                <VehicleImage src={c.vehicle.images[0]?.imageUrl} alt="" sizes="56px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn("truncate text-sm", c.unread ? "font-semibold" : "font-medium")}>{c.other.name ?? "CarSwipe user"}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(c.lastMessageAt)}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {c.role === "seller" ? "Inquiry · " : ""}{vehicleTitle(c.vehicle)} · {formatPrice(c.vehicle.price)}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <p className={cn("min-w-0 flex-1 truncate text-sm", c.unread ? "text-foreground" : "text-muted-foreground")}>{preview}</p>
                  {c.unread > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                      {c.unread}<span className="sr-only"> unread</span>
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
