"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSavedStore } from "@/store/saved";
import { useViewer } from "@/components/providers/viewer-context";
import { api } from "@/lib/fetcher";

/** Optimistic save/unsave with rollback. Signed-out users are sent to sign in. */
export function useToggleSave(vehicleId: string) {
  const viewer = useViewer();
  const router = useRouter();
  const saved = useSavedStore((s) => s.ids.has(vehicleId));
  const pending = useRef(false);

  const toggle = useCallback(async () => {
    if (!viewer) {
      toast("Sign in to save cars to your garage", {
        action: { label: "Sign in", onClick: () => router.push(`/login?callbackUrl=${encodeURIComponent(location.pathname + location.search)}`) },
      });
      return;
    }
    if (pending.current) return;
    pending.current = true;
    const { add, remove } = useSavedStore.getState();
    const wasSaved = useSavedStore.getState().ids.has(vehicleId);
    if (wasSaved) remove(vehicleId);
    else add(vehicleId);
    try {
      await api(`/api/saved/${vehicleId}`, { method: wasSaved ? "DELETE" : "POST" });
      if (!wasSaved) toast.success("Saved to My Garage");
    } catch (err) {
      if (wasSaved) add(vehicleId);
      else remove(vehicleId);
      toast.error(err instanceof Error ? err.message : "Couldn't update your garage");
    } finally {
      pending.current = false;
    }
  }, [viewer, vehicleId, router]);

  return { saved, toggle };
}
