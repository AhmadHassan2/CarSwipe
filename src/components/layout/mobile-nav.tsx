"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV, SELL_LINK, isActive } from "./nav-links";
import { CountBadge } from "./count-badge";
import { useCounts } from "@/hooks/use-counts";
import { cn } from "@/lib/utils";

const ITEMS = [PRIMARY_NAV[0]!, PRIMARY_NAV[1]!, SELL_LINK, PRIMARY_NAV[2]!, PRIMARY_NAV[3]!];

export function MobileNav() {
  const pathname = usePathname();
  const { data: counts } = useCounts();
  return (
    <nav aria-label="Main" className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-lg md:hidden">
      <ul className="mx-auto flex h-16 max-w-md items-stretch justify-around px-2">
        {ITEMS.map((link) => {
          const active = isActive(pathname, link.href);
          const Icon = link.icon;
          const isSell = link.href === SELL_LINK.href;
          return (
            <li key={link.href} className="flex flex-1">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted-foreground",
                  active && "text-foreground",
                )}
              >
                {isSell ? (
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-float">
                    <Icon className="size-5" />
                  </span>
                ) : (
                  <span className="relative">
                    <Icon className={cn("size-[22px]", active && "fill-muted")} />
                    {link.countKey && <CountBadge count={counts?.[link.countKey]} />}
                  </span>
                )}
                {!isSell && link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
