"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const MAX_COMPARE = 4;

type CompareState = {
  ids: string[];
  toggle: (id: string) => "added" | "removed" | "full";
  remove: (id: string) => void;
  replace: (oldId: string, newId: string) => void;
  clear: () => void;
};

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const { ids } = get();
        if (ids.includes(id)) {
          set({ ids: ids.filter((x) => x !== id) });
          return "removed";
        }
        if (ids.length >= MAX_COMPARE) return "full";
        set({ ids: [...ids, id] });
        return "added";
      },
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      replace: (oldId, newId) =>
        set((s) => ({ ids: s.ids.includes(newId) ? s.ids : s.ids.map((x) => (x === oldId ? newId : x)) })),
      clear: () => set({ ids: [] }),
    }),
    { name: "carswipe-compare", storage: createJSONStorage(() => localStorage) },
  ),
);
