import "server-only";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { headers } from "next/headers";
import { authConfig } from "@/auth.config";
import { db } from "@/server/db";
import { loginSchema } from "@/features/auth/schemas";
import { verifyPassword } from "@/server/password";
import { limit, rateLimitsEnabled } from "@/server/rate-limit";

class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

export const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db as unknown as Parameters<typeof PrismaAdapter>[0]),
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        if (rateLimitsEnabled()) {
          const ip = await clientIp();
          if (!limit("login", `${ip}:${email}`).ok) throw new RateLimitedError();
        }

        const user = await db.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, image: true, passwordHash: true },
        });
        const valid = await verifyPassword(password, user?.passwordHash);
        if (!user || !valid) return null;
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
    ...(googleEnabled ? [Google({ allowDangerousEmailAccountLinking: false })] : []),
  ],
});

/** Returns the signed-in user's id or null. */
export async function currentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
