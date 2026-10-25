import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8", className)}>
      <rect x="9" y="3" width="18" height="24" rx="5" fill="currentColor" opacity="0.2" transform="rotate(12 18 15)" />
      <rect x="5" y="5" width="18" height="24" rx="5" fill="currentColor" />
      <path
        d="M9.2 20.2h9.6m-9.9-1.7.9-2.7c.3-.8 1-1.3 1.8-1.3h5.2c.8 0 1.5.5 1.8 1.3l.9 2.7m-10.6 0v2.4m10.6-2.4v2.4"
        stroke="var(--background)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="11.4" cy="10.4" r="1.3" fill="var(--background)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 rounded-lg", className)} aria-label="CarSwipe home">
      <LogoMark />
      <span className="text-[1.15rem] font-semibold tracking-tight">
        Car<span className="text-muted-foreground">Swipe</span>
      </span>
    </Link>
  );
}
