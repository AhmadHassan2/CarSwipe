"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type GuestSwipe = { vehicleId: string; direction: "LIKE" | "PASS"; at: number };

/** Swipes made while signed out. Imported into the account after sign-in. */
type GuestSwipeState = {
  swipes: GuestSwipe[];
  record: (s: Omit<GuestSwipe, "at">) => void;
  undo: (vehicleId: string) => void;
  clear: () => void;
};

export const useGuestSwipes = create<GuestSwipeState>()(
  persist(
    (set) => ({
      swipes: [],
      record: (s) =>
        set((st) => ({ swipes: [...st.swipes.filter((x) => x.vehicleId !== s.vehicleId), { ...s, at: Date.now() }].slice(-200) })),
      undo: (vehicleId) => set((st) => ({ swipes: st.swipes.filter((x) => x.vehicleId !== vehicleId) })),
      clear: () => set({ swipes: [] }),
    }),
    { name: "carswipe-guest-swipes", storage: createJSONStorage(() => localStorage) },
  ),
);
