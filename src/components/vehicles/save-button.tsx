"use client";

import { Heart } from "lucide-react";
import { useToggleSave } from "@/hooks/use-toggle-save";
import { cn } from "@/lib/utils";

export function SaveButton({ vehicleId, className, variant = "overlay" }: { vehicleId: string; className?: string; variant?: "overlay" | "outline" }) {
  const { saved, toggle } = useToggleSave(vehicleId);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      aria-pressed={saved}
      aria-label={saved ? "Remove from My Garage" : "Save to My Garage"}
      className={cn(
        "flex items-center justify-center rounded-full transition-transform active:scale-90",
        variant === "overlay"
          ? "size-9 bg-white/90 text-zinc-800 shadow-card backdrop-blur hover:bg-white"
          : "h-10 gap-2 border bg-surface px-4 text-sm font-medium hover:border-foreground/30",
        className,
      )}
    >
      <Heart className={cn("size-[18px]", saved && "fill-like text-like")} />
      {variant === "outline" && (saved ? "Saved" : "Save")}
    </button>
  );
}
