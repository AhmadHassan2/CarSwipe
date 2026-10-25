import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { AppError } from "@/server/errors";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_EDGE = 2000;
const ALLOWED = new Set(["jpeg", "png", "webp", "heif", "avif"]);
const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

export type StoredImage = { url: string; key: string; width: number; height: number };

/**
 * Validates by decoding (not by extension or client MIME), auto-rotates,
 * downsizes and re-encodes to WebP. Re-encoding drops EXIF, so phone GPS
 * metadata never gets published.
 *
 * Files land in public/uploads/<userId>/ — fine for local and single-server
 * deploys. Swap this module for object storage (S3, Cloudinary) for serverless.
 */
export async function storeListingImage(userId: string, file: File): Promise<StoredImage> {
  if (file.size === 0) throw new AppError("INVALID", "That file is empty");
  if (file.size > MAX_UPLOAD_BYTES) throw new AppError("INVALID", "Photos must be 10 MB or smaller");

  const input = Buffer.from(await file.arrayBuffer());
  let meta;
  try {
    meta = await sharp(input, { limitInputPixels: 50_000_000 }).metadata();
  } catch {
    throw new AppError("INVALID", "That file isn't a supported image");
  }
  if (!meta.format || !ALLOWED.has(meta.format)) throw new AppError("INVALID", "Use a JPEG, PNG, WebP or HEIC photo");

  const { data, info } = await sharp(input, { limitInputPixels: 50_000_000 })
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const safeUser = userId.replace(/[^a-z0-9]/gi, "");
  const name = `${randomBytes(12).toString("hex")}.webp`;
  const dir = path.join(UPLOAD_ROOT, safeUser);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), data);
  return { url: `/uploads/${safeUser}/${name}`, key: `${safeUser}/${name}`, width: info.width, height: info.height };
}

/** True when `url` is an upload that belongs to `userId`. */
export function isOwnUpload(userId: string, url: string) {
  const safeUser = userId.replace(/[^a-z0-9]/gi, "");
  return new RegExp(`^/uploads/${safeUser}/[a-f0-9]{24}\\.webp$`).test(url);
}

export async function deleteStoredImage(key: string | null | undefined) {
  if (!key || !/^[a-z0-9]+\/[a-f0-9]{24}\.webp$/i.test(key)) return;
  await unlink(path.join(UPLOAD_ROOT, key)).catch(() => {});
}
