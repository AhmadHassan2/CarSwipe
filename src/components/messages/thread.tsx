"use client";

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessageAction } from "@/app/actions/messages";
import { api } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

type Msg = { id: string; senderId: string; content: string; createdAt: string; readAt: string | null; pending?: boolean };

const POLL_MS = 4000;

function dayLabel(d: Date) {
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
}

export function Thread({ conversationId, viewerId, initial, closed }: { conversationId: string; viewerId: string; initial: Msg[]; closed: boolean }) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [draft, setDraft] = useState("");
  const [pending, start] = useTransition();
  const bottom = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const router = useRouter();
  const latest = messages.filter((m) => !m.pending).at(-1)?.createdAt;

  useLayoutEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  // Poll for new messages; swap for a websocket/SSE push later.
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (document.hidden) return;
      try {
        const qs = latest ? `?after=${encodeURIComponent(latest)}` : "";
        const { messages: fresh, readUpTo } = await api<{ messages: Msg[]; readUpTo: string | null }>(`/api/conversations/${conversationId}/messages${qs}`);
        if (cancelled) return;
        if (readUpTo) {
          setMessages((cur) =>
            cur.some((m) => m.senderId === viewerId && !m.readAt && !m.pending && m.createdAt <= readUpTo)
              ? cur.map((m) => (m.senderId === viewerId && !m.readAt && !m.pending && m.createdAt <= readUpTo ? { ...m, readAt: readUpTo } : m))
              : cur,
          );
        }
        if (!fresh.length) return;
        setMessages((cur) => {
          const known = new Set(cur.map((m) => m.id));
          // A poll can land before sendMessageAction returns; skip our own
          // message if an optimistic copy of it is still pending.
          const pendingTexts = cur.filter((m) => m.pending).map((m) => m.content);
          const add = fresh.filter((m) => {
            if (known.has(m.id)) return false;
            const i = m.senderId === viewerId ? pendingTexts.indexOf(m.content) : -1;
            if (i === -1) return true;
            pendingTexts.splice(i, 1);
            return false;
          });
          return add.length ? [...cur, ...add] : cur;
        });
        qc.invalidateQueries({ queryKey: ["counts"] });
        router.refresh(); // update the inbox list previews
      } catch {
        /* transient; next tick retries */
      }
    };
    const t = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [conversationId, latest, qc, viewerId, router]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const tempId = `temp-${Date.now()}`;
    setMessages((m) => [...m, { id: tempId, senderId: viewerId, content: text, createdAt: new Date().toISOString(), readAt: null, pending: true }]);
    setDraft("");
    start(async () => {
      const res = await sendMessageAction(conversationId, text);
      if (!res.ok) {
        setMessages((m) => m.filter((x) => x.id !== tempId));
        setDraft(text);
        toast.error(res.error);
        return;
      }
      setMessages((m) =>
        m.some((x) => x.id === res.messageId)
          ? m.filter((x) => x.id !== tempId)
          : m.map((x) => (x.id === tempId ? { ...x, id: res.messageId, createdAt: res.createdAt, pending: false } : x)),
      );
      router.refresh();
    });
  };

  const dayLabels = messages.map((m) => dayLabel(new Date(m.createdAt)));
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-4" role="log" aria-live="polite" aria-label="Messages">
        {messages.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No messages yet. Say hello.</p>}
        {messages.map((m, i) => {
          const mine = m.senderId === viewerId;
          const d = new Date(m.createdAt);
          const label = dayLabels[i]!;
          const showDay = i === 0 || label !== dayLabels[i - 1];
          const nextSame = messages[i + 1]?.senderId === m.senderId;
          return (
            <div key={m.id}>
              {showDay && <p className="my-4 text-center text-xs font-medium text-muted-foreground">{label}</p>}
              <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words",
                    mine ? "bg-primary text-primary-foreground" : "bg-muted",
                    mine ? (nextSame ? "rounded-br-md" : "") : nextSame ? "rounded-bl-md" : "",
                    m.pending && "opacity-60",
                  )}
                >
                  {m.content}
                </div>
              </div>
              {!nextSame && (
                <p className={cn("mt-1 mb-2 text-[11px] text-muted-foreground", mine ? "text-right" : "text-left")}>
                  {d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" })}
                  {mine && !m.pending && (m.readAt ? " · Read" : " · Sent")}
                  {m.pending && " · Sending…"}
                </p>
              )}
            </div>
          );
        })}
        <div ref={bottom} />
      </div>
      {closed ? (
        <p className="border-t p-4 text-center text-sm text-muted-foreground">This listing is no longer available, so the conversation is closed.</p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-end gap-2 border-t p-3">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder="Write a message…"
            aria-label="Message"
            className="max-h-36 min-h-10 resize-none"
          />
          <Button type="submit" size="icon" className="size-10 shrink-0" disabled={!draft.trim() || pending} aria-label="Send message">
            <SendHorizontal />
          </Button>
        </form>
      )}
    </div>
  );
}
