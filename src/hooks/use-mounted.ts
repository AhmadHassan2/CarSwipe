"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True after hydration — for UI that depends on localStorage-backed stores. */
export function useMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
