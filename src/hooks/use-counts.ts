"use client";

import { useQuery } from "@tanstack/react-query";
import { useViewer } from "@/components/providers/viewer-context";
import { api } from "@/lib/fetcher";

/** Unread messages + notifications. Polled; swap for SSE/websocket push later. */
export function useCounts() {
  const viewer = useViewer();
  return useQuery({
    queryKey: ["counts"],
    queryFn: () => api<{ messages: number; notifications: number }>("/api/me/counts"),
    enabled: Boolean(viewer),
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });
}
