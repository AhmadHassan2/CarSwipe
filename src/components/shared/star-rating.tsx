import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only star display. Partial stars are drawn by clipping a filled layer. */
export function Stars({ value, className, size = "size-4" }: { value: number; className?: string; size?: string }) {
  return (
    <span className={cn("relative inline-flex", className)} role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      <span className="flex text-muted-foreground/35">
        {Array.from({ length: 5 }, (_, i) => <Star key={i} className={cn(size, "fill-current")} strokeWidth={0} />)}
      </span>
      <span className="absolute inset-0 flex overflow-hidden text-foreground" style={{ width: `${(Math.max(0, Math.min(5, value)) / 5) * 100}%` }}>
        {Array.from({ length: 5 }, (_, i) => <Star key={i} className={cn(size, "shrink-0 fill-current")} strokeWidth={0} />)}
      </span>
    </span>
  );
}

export function RatingSummaryInline({ average, count, className }: { average: number; count: number; className?: string }) {
  if (!count) return <span className={cn("text-xs text-muted-foreground", className)}>No reviews yet</span>;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", className)}>
      <Stars value={average} size="size-3.5" />
      <span className="font-semibold">{average.toFixed(1)}</span>
      <span className="text-muted-foreground">({count} {count === 1 ? "review" : "reviews"})</span>
    </span>
  );
}
