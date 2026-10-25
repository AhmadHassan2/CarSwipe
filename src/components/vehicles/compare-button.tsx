"use client";

import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompareToggle } from "@/hooks/use-compare";
import { useMounted } from "@/hooks/use-mounted";

export function CompareButton({ vehicleId }: { vehicleId: string }) {
  const { inCompare, toggle } = useCompareToggle(vehicleId);
  const mounted = useMounted();
  const on = mounted && inCompare;
  return (
    <Button variant="outline" onClick={toggle} aria-pressed={on} className="h-10 gap-2">
      <Scale /> {on ? "In compare" : "Compare"}
    </Button>
  );
}
