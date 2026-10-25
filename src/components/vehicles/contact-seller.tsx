"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useViewer } from "@/components/providers/viewer-context";
import { contactSellerAction } from "@/app/actions/messages";

export function ContactSeller({ vehicleId, title, isOwner, unavailable }: { vehicleId: string; title: string; isOwner: boolean; unavailable: boolean }) {
  const viewer = useViewer();
  const router = useRouter();
  const [message, setMessage] = useState(`Hi, is the ${title} still available?`);
  const [pending, start] = useTransition();

  if (isOwner) {
    return <Button asChild variant="outline" className="w-full"><Link href={`/dashboard`}>Manage this listing</Link></Button>;
  }
  if (!viewer) {
    return (
      <Button asChild variant="brand" className="h-11 w-full">
        <Link href={`/login?callbackUrl=${encodeURIComponent(`/vehicles/${vehicleId}`)}`}><MessageCircle /> Sign in to message seller</Link>
      </Button>
    );
  }
  if (unavailable) return <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">This listing is no longer accepting inquiries.</p>;

  const send = () =>
    start(async () => {
      const res = await contactSellerAction(vehicleId, message);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Message sent");
      router.push(`/messages/${res.conversationId}`);
    });

  return (
    <form onSubmit={(e) => { e.preventDefault(); send(); }} className="space-y-3">
      <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={2000} aria-label="Message to seller" />
      <Button type="submit" variant="brand" className="h-11 w-full" disabled={pending || !message.trim()}>
        <MessageCircle /> {pending ? "Sending…" : "Message seller"}
      </Button>
    </form>
  );
}
