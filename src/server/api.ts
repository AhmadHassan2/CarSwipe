import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/server/auth";
import { AppError, HTTP_STATUS } from "@/server/errors";
import { limit, rateLimitsEnabled, type LIMITS } from "@/server/rate-limit";

export function jsonError(status: number, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/** Wraps a route handler: maps AppError/ZodError to JSON, logs unexpected errors without request bodies. */
export function route<Args extends unknown[]>(fn: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof AppError) return jsonError(HTTP_STATUS[err.code], err.message);
      if (err instanceof ZodError) return jsonError(400, "Invalid request", { issues: err.issues.map((i) => ({ path: i.path, message: i.message })) });
      console.error("[api] unexpected error:", err instanceof Error ? err.message : err);
      return jsonError(500, "Something went wrong. Please try again.");
    }
  };
}

export async function requireUserId() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) throw new AppError("UNAUTHORIZED", "Please sign in to continue");
  return id;
}

export function enforceLimit(kind: keyof typeof LIMITS, key: string) {
  if (!rateLimitsEnabled()) return;
  const res = limit(kind, key);
  if (!res.ok) throw new AppError("RATE_LIMITED", `Too many requests. Try again in ${res.retryAfter}s.`);
}

export async function readJson(req: Request) {
  try {
    return await req.json();
  } catch {
    throw new AppError("INVALID", "Invalid JSON body");
  }
}
