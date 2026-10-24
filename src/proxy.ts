import NextAuth from "next-auth";
import type { NextFetchEvent, NextRequest } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

// Called without a handler so Auth.js applies `callbacks.authorized` and
// redirects signed-out users to /login (a handler would skip that redirect).
export function proxy(request: NextRequest, event: NextFetchEvent) {
  return (auth as unknown as (req: NextRequest, ev: NextFetchEvent) => Promise<Response>)(request, event);
}

export const config = {
  matcher: [
    "/saved/:path*",
    "/sell/:path*",
    "/dashboard/:path*",
    "/messages/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
  ],
};
