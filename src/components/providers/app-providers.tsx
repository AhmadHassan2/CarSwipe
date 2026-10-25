"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ViewerProvider } from "./viewer-context";
import { useSavedStore } from "@/store/saved";
import { useGuestSwipes } from "@/store/guest-swipes";
import type { Viewer } from "@/types/viewer";

export function AppProviders({
  viewer,
  savedIds,
  children,
}: {
  viewer: Viewer | null;
  savedIds: string[];
  children: ReactNode;
}) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 } } }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <ViewerProvider value={viewer}>
          <TooltipProvider delayDuration={300}>
            <SavedHydrator ids={savedIds} />
            {viewer && <GuestSwipeImporter />}
            {children}
            <Toaster position="top-center" richColors closeButton />
          </TooltipProvider>
        </ViewerProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function SavedHydrator({ ids }: { ids: string[] }) {
  const hydrate = useSavedStore((s) => s.hydrate);
  const key = ids.join(",");
  useEffect(() => {
    hydrate(key ? key.split(",") : []);
  }, [key, hydrate]);
  return null;
}

/** After sign-in, move any swipes made as a guest into the account once. */
function GuestSwipeImporter() {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const { swipes, clear } = useGuestSwipes.getState();
    if (!swipes.length) return;
    fetch("/api/swipe/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ swipes: swipes.map(({ vehicleId, direction }) => ({ vehicleId, direction })) }),
    })
      .then((r) => {
        if (r.ok) {
          clear();
          const add = useSavedStore.getState().add;
          swipes.filter((s) => s.direction === "LIKE").forEach((s) => add(s.vehicleId));
        }
      })
      .catch(() => {});
  }, []);
  return null;
}
