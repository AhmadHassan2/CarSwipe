"use client";

import { create } from "zustand";

/** Client mirror of the user's saved vehicles so swipe, browse and detail views stay in sync. */
type SavedState = {
  ids: Set<string>;
  hydrated: boolean;
  hydrate: (ids: string[]) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
};

export const useSavedStore = create<SavedState>((set) => ({
  ids: new Set(),
  hydrated: false,
  hydrate: (ids) => set({ ids: new Set(ids), hydrated: true }),
  add: (id) => set((s) => (s.ids.has(id) ? s : { ids: new Set(s.ids).add(id) })),
  remove: (id) =>
    set((s) => {
      if (!s.ids.has(id)) return s;
      const ids = new Set(s.ids);
      ids.delete(id);
      return { ids };
    }),
}));
