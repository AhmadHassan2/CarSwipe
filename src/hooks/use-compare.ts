"use client";

import { toast } from "sonner";
import { useCompareStore, MAX_COMPARE } from "@/store/compare";

export function useCompareToggle(vehicleId: string) {
  const inCompare = useCompareStore((s) => s.ids.includes(vehicleId));
  const toggle = () => {
    const result = useCompareStore.getState().toggle(vehicleId);
    if (result === "full") toast.error(`You can compare up to ${MAX_COMPARE} cars. Remove one first.`);
    else if (result === "added") toast.success("Added to compare", { action: { label: "View", onClick: () => (window.location.href = "/compare") } });
  };
  return { inCompare, toggle };
}
