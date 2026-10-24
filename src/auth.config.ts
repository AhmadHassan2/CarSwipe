import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config shared by the proxy and the full server config.
 * It must not import Prisma or bcrypt.
 */
export const PROTECTED_PREFIXES = [
  "/saved",
  "/sell",
  "/dashboard",
  "/messages",
  "/profile",
  "/settings",
  "/onboarding",
];

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const needsAuth = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
      if (needsAuth && !auth?.user) return false;
      return true;
    },
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub && session.user) session.user.id = token.sub;
      return session;
    },
  },
} satisfies NextAuthConfig;
