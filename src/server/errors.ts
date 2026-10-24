import "server-only";

/** Expected, user-facing failures. Route handlers map these to HTTP statuses. */
export class AppError extends Error {
  constructor(
    public readonly code: "NOT_FOUND" | "FORBIDDEN" | "CONFLICT" | "INVALID" | "RATE_LIMITED" | "UNAUTHORIZED",
    message: string,
  ) {
    super(message);
  }
}

export const HTTP_STATUS: Record<AppError["code"], number> = {
  INVALID: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
};
