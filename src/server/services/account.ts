import "server-only";
import { db } from "@/server/db";
import { AppError } from "@/server/errors";
import { hashPassword, verifyPassword } from "@/server/password";
import { deleteStoredImage } from "@/server/storage/images";

export async function getProfile(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, image: true, phone: true, sellerType: true, dealerName: true, createdAt: true,
      passwordHash: true,
      preferences: true,
      _count: {
        select: {
          saved: true,
          swipes: true,
          vehicles: { where: { status: { in: ["ACTIVE", "PENDING"] } } },
          buyerConvos: true,
          sellerConvos: true,
        },
      },
    },
  });
  if (!user) throw new AppError("NOT_FOUND", "Account not found");
  const { passwordHash, ...rest } = user;
  return { ...rest, hasPassword: Boolean(passwordHash) };
}
export type Profile = Awaited<ReturnType<typeof getProfile>>;

export async function updateProfile(userId: string, data: { name: string; phone?: string | null; sellerType: "PRIVATE" | "DEALER"; dealerName?: string | null }) {
  if (data.sellerType === "DEALER" && !data.dealerName) throw new AppError("INVALID", "Enter your dealership's name");
  return db.user.update({
    where: { id: userId },
    data: { name: data.name, phone: data.phone || null, sellerType: data.sellerType, dealerName: data.sellerType === "DEALER" ? data.dealerName : null },
    select: { id: true },
  });
}

export async function updateNotificationPrefs(userId: string, data: { notifyMessages: boolean; notifyInquiries: boolean }) {
  return db.userPreferences.upsert({ where: { userId }, create: { userId, ...data }, update: data });
}

export async function updateThemePref(userId: string, theme: "LIGHT" | "DARK" | "SYSTEM") {
  return db.userPreferences.upsert({ where: { userId }, create: { userId, theme }, update: { theme } });
}

export async function changePassword(userId: string, current: string, next: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user) throw new AppError("NOT_FOUND", "Account not found");
  // Accounts created with Google have no password yet; they can set one without the current password.
  if (user.passwordHash && !(await verifyPassword(current, user.passwordHash))) throw new AppError("INVALID", "Your current password is incorrect");
  await db.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(next) } });
}

/** Permanently deletes the account. Listings, saves, swipes and messages cascade. */
export async function deleteAccount(userId: string, password: string | undefined) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user) return;
  if (user.passwordHash && !(await verifyPassword(password ?? "", user.passwordHash))) throw new AppError("INVALID", "Password is incorrect");
  const images = await db.vehicleImage.findMany({ where: { vehicle: { sellerId: userId } }, select: { storageKey: true } });
  await db.user.delete({ where: { id: userId } });
  await Promise.all(images.map((i) => deleteStoredImage(i.storageKey)));
}
