"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, RotateCcw, SearchX, X } from "lucide-react";
import { toast } from "sonner";
import { SwipeCard, type SwipeVehicle } from "./swipe-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useViewer } from "@/components/providers/viewer-context";
import { useSavedStore } from "@/store/saved";
import { useGuestSwipes } from "@/store/guest-swipes";
import { api } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

type Dir = "LIKE" | "PASS";
const REFILL_AT = 3;

export function SwipeDeck({ initial, queryString }: { initial: SwipeVehicle[]; queryString: string }) {
  const viewer = useViewer();
  const [deck, setDeck] = useState(initial);
  const [history, setHistory] = useState<{ vehicle: SwipeVehicle; direction: Dir }[]>([]);
  const [exhausted, setExhausted] = useState(initial.length === 0);
  const loading = useRef(false);
  const seen = useRef(new Set(initial.map((v) => v.id)));
  const guestSwipes = useGuestSwipes();

  const refill = useCallback(async () => {
    if (loading.current || exhausted) return;
    loading.current = true;
    try {
      const exclude = [...seen.current].join(",");
      const params = new URLSearchParams(queryString);
      params.set("exclude", exclude);
      params.set("limit", "10");
      const guestSeen = useGuestSwipes.getState().swipes.map((s) => s.vehicleId);
      if (!viewer && guestSeen.length) params.set("exclude", [exclude, ...guestSeen].join(","));
      const { vehicles } = await api<{ vehicles: SwipeVehicle[] }>(`/api/swipe/queue?${params}`);
      const fresh = vehicles.filter((v) => !seen.current.has(v.id));
      fresh.forEach((v) => seen.current.add(v.id));
      if (!fresh.length) setExhausted(true);
      else setDeck((d) => [...d, ...fresh]);
    } catch {
      /* keep the current deck; the next swipe retries */
    } finally {
      loading.current = false;
    }
  }, [exhausted, queryString, viewer]);

  useEffect(() => {
    if (deck.length <= REFILL_AT) void refill();
  }, [deck.length, refill]);

  const swipe = useCallback(
    (direction: Dir) => {
      const vehicle = deck[0];
      if (!vehicle) return;
      setHistory((h) => [...h.slice(-9), { vehicle, direction }]);
      // let the fling animation finish before removing the card
      setTimeout(() => setDeck((d) => d.filter((v) => v.id !== vehicle.id)), 200);

      if (direction === "LIKE") useSavedStore.getState().add(vehicle.id);
      if (!viewer) {
        guestSwipes.record({ vehicleId: vehicle.id, direction });
        if (direction === "LIKE" && guestSwipes.swipes.filter((s) => s.direction === "LIKE").length === 2) {
          toast("Sign in to keep your likes", { action: { label: "Sign in", onClick: () => (window.location.href = "/login?callbackUrl=/swipe") } });
        }
        return;
      }
      api("/api/swipe", { method: "POST", json: { vehicleId: vehicle.id, direction } }).catch((err) => {
        toast.error(err instanceof Error ? err.message : "Couldn't record that swipe");
        if (direction === "LIKE") useSavedStore.getState().remove(vehicle.id);
      });
    },
    [deck, viewer, guestSwipes],
  );

  const undo = useCallback(async () => {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory((h) => h.slice(0, -1));
    setDeck((d) => [last.vehicle, ...d]);
    if (last.direction === "LIKE") useSavedStore.getState().remove(last.vehicle.id);
    if (!viewer) return guestSwipes.undo(last.vehicle.id);
    try {
      await api("/api/swipe/undo", { method: "POST", json: { vehicleId: last.vehicle.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't undo");
    }
  }, [history, viewer, guestSwipes]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") swipe("LIKE");
      else if (e.key === "ArrowLeft") swipe("PASS");
      else if (e.key === "z" || e.key === "Backspace") void undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [swipe, undo]);

  if (!deck.length) {
    return (
      <EmptyState
        icon={SearchX}
        title={history.length || exhausted ? "You're all caught up" : "Loading more cars…"}
        description="You've seen every car that matches. Loosen your filters or check back soon for new listings."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            {history.length > 0 && <Button variant="outline" onClick={undo}><RotateCcw /> Undo last swipe</Button>}
            <Button asChild><Link href="/saved">Open My Garage</Link></Button>
            <Button asChild variant="outline"><Link href="/browse">Browse all</Link></Button>
          </div>
        }
      />
    );
  }

  const visible = deck.slice(0, 3);
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="relative aspect-[3/4] w-full" role="group" aria-label="Swipe deck. Use left and right arrow keys to pass or like.">
        {[...visible].reverse().map((v) => {
          const depth = visible.indexOf(v);
          return <SwipeCard key={v.id} vehicle={v} active={depth === 0} depth={depth} onSwipe={swipe} />;
        })}
      </div>
      <div className="mt-6 flex items-center justify-center gap-5">
        <Button variant="outline" size="icon" className="size-12 rounded-full" onClick={undo} disabled={!history.length} aria-label="Undo last swipe">
          <RotateCcw />
        </Button>
        <button onClick={() => swipe("PASS")} aria-label="Pass" className={cn("flex size-16 items-center justify-center rounded-full border bg-surface shadow-card transition-transform hover:scale-105 active:scale-95")}>
          <X className="size-7" />
        </button>
        <button onClick={() => swipe("LIKE")} aria-label="Like and save" className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-float transition-transform hover:scale-105 active:scale-95">
          <Heart className="size-7 fill-current" />
        </button>
      </div>
      <p className="mt-4 hidden text-center text-xs text-muted-foreground sm:block">Tip: use ← to pass, → to like, Z to undo.</p>
    </div>
  );
}
