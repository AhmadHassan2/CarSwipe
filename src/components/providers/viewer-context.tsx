"use client";

import { createContext, useContext } from "react";
import type { Viewer } from "@/types/viewer";

const ViewerContext = createContext<Viewer | null>(null);

export const ViewerProvider = ViewerContext.Provider;

export function useViewer() {
  return useContext(ViewerContext);
}
