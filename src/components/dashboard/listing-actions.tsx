"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/fetcher";

type Status = "DRAFT" | "ACTIVE" | "PENDING" | "SOLD";

const ACTIONS: Record<Status, { to: Status; label: string }[]> = {
  DRAFT: [{ to: "ACTIVE", label: "Publish" }],
  ACTIVE: [{ to: "PENDING", label: "Mark sale pending" }, { to: "SOLD", label: "Mark as sold" }, { to: "DRAFT", label: "Unpublish" }],
  PENDING: [{ to: "ACTIVE", label: "Back on the market" }, { to: "SOLD", label: "Mark as sold" }],
  SOLD: [{ to: "ACTIVE", label: "Relist" }],
};

export function ListingActions({ id, title, status }: { id: string; title: string; status: Status }) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(success);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={busy} aria-label={`Actions for ${title}`}><MoreHorizontal /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem asChild><Link href={`/sell/${id}/edit`}>Edit listing</Link></DropdownMenuItem>
          {status !== "DRAFT" && <DropdownMenuItem asChild><Link href={`/vehicles/${id}`}>View listing</Link></DropdownMenuItem>}
          <DropdownMenuSeparator />
          {ACTIONS[status].map((a) => (
            <DropdownMenuItem key={a.to} onSelect={() => run(() => api(`/api/listings/${id}`, { method: "PATCH", json: { status: a.to } }), `${title}: ${a.label.toLowerCase()}`)}>
              {a.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}>Delete listing</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              {title} will be removed from CarSwipe and buyers’ garages. Existing conversations stay in Messages. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep listing</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => run(() => api(`/api/listings/${id}`, { method: "DELETE" }), "Listing deleted")}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
