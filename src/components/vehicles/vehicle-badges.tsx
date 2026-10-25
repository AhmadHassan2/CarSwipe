import { BadgeCheck, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NEW_LISTING_MS = 3 * 86_400_000;

export function isNewListing(publishedAt: Date | string | null) {
  return publishedAt ? Date.now() - new Date(publishedAt).getTime() < NEW_LISTING_MS : false;
}

export function ListingBadges({
  publishedAt,
  condition,
  sellerType,
  className,
}: {
  publishedAt: Date | string | null;
  condition: string;
  sellerType: string;
  className?: string;
}) {
  const pill = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold backdrop-blur";
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {isNewListing(publishedAt) && (
        <span className={cn(pill, "bg-brand-gradient text-white")}>
          New
        </span>
      )}
      {condition === "CERTIFIED" && (
        <span className={cn(pill, "bg-white/90 text-zinc-800")}>
          <BadgeCheck className="size-3" /> Certified
        </span>
      )}
      {sellerType === "DEALER" && (
        <span className={cn(pill, "bg-white/90 text-zinc-700")}>
          <Building2 className="size-3" /> Dealer
        </span>
      )}
    </div>
  );
}
