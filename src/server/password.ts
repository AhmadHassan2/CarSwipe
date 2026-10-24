import "server-only";
import bcrypt from "bcryptjs";

const COST = 12;
// Pre-computed hash used to keep timing consistent when the email is unknown.
const DUMMY_HASH = "$2b$12$agpEs8QM3bTZIuBivaYRLu45jGLcFtJ.ypN/mm0XNHQjx/7p3XU..";

export function hashPassword(password: string) {
  return bcrypt.hash(password, COST);
}

export async function verifyPassword(password: string, hash: string | null | undefined) {
  if (!hash) {
    await bcrypt.compare(password, DUMMY_HASH);
    return false;
  }
  return bcrypt.compare(password, hash);
}
