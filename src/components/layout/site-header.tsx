"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { Logo } from "./logo";
import { SearchCommand } from "./search-command";
import { NotificationsMenu } from "./notifications-menu";
import { UserMenu } from "./user-menu";
import { CountBadge } from "./count-badge";
import { PRIMARY_NAV, isActive } from "./nav-links";
import { Button } from "@/components/ui/button";
import { useViewer } from "@/components/providers/viewer-context";
import { useCounts } from "@/hooks/use-counts";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const viewer = useViewer();
  const pathname = usePathname();
  const { data: counts } = useCounts();

  return (
    <header className="pt-safe sticky top-0 z-40 border-b bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
          {PRIMARY_NAV.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  active && "bg-muted text-foreground hover:text-foreground",
                )}
              >
                {link.label}
                {link.countKey && <CountBadge count={counts?.[link.countKey]} className="-top-0.5 -right-0.5" />}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div className="hidden lg:block">
            <SearchCommand />
          </div>
          <div className="lg:hidden">
            <SearchCommand variant="icon" />
          </div>
          {viewer ? (
            <>
              <Button asChild size="sm" variant="brand" className="hidden rounded-full sm:inline-flex">
                <Link href="/sell"><Plus /> Sell your car</Link>
              </Button>
              <NotificationsMenu />
              <UserMenu viewer={viewer} />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" variant="brand" className="rounded-full">
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
