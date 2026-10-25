"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, MessageCircle, Inbox, Heart, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CountBadge } from "./count-badge";
import { useCounts } from "@/hooks/use-counts";
import { api } from "@/lib/fetcher";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: "INQUIRY" | "MESSAGE" | "LISTING_SAVED" | "SYSTEM";
  title: string;
  content: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

const ICONS = { INQUIRY: Inbox, MESSAGE: MessageCircle, LISTING_SAVED: Heart, SYSTEM: Info };

export function NotificationsMenu() {
  const { data: counts } = useCounts();
  const qc = useQueryClient();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<{ notifications: Notification[] }>("/api/notifications"),
    enabled: false,
  });

  const markAllRead = async () => {
    await api("/api/notifications", { method: "PATCH", json: {} }).catch(() => {});
    qc.invalidateQueries({ queryKey: ["counts"] });
    refetch();
  };

  return (
    <Popover onOpenChange={(open) => open && refetch()}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-5" />
          <CountBadge count={counts?.notifications} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {!!counts?.notifications && (
            <button onClick={markAllRead} className="text-xs font-medium text-foreground hover:underline">
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : !data?.notifications.length ? (
            <div className="p-8 text-center">
              <Bell className="mx-auto mb-2 size-6 text-muted-foreground" />
              <p className="text-sm font-medium">You're all caught up</p>
              <p className="text-xs text-muted-foreground">Inquiries and messages will show up here.</p>
            </div>
          ) : (
            <ul>
              {data.notifications.map((n) => {
                const Icon = ICONS[n.type];
                const body = (
                  <div className={cn("flex gap-3 px-4 py-3 transition-colors hover:bg-muted", !n.readAt && "bg-muted/60")}>
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{n.content}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.readAt && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                  </div>
                );
                return <li key={n.id}>{n.href ? <Link href={n.href}>{body}</Link> : body}</li>;
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
