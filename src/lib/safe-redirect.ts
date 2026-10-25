/**
 * Post-login destination. Accepts a relative path, or an absolute URL from
 * which only the path is kept (Auth.js passes absolute callback URLs), so a
 * crafted link can never send someone to another site.
 */
export function safeRedirect(target: unknown, fallback = "/swipe") {
  if (typeof target !== "string" || !target) return fallback;
  let path = target;
  if (/^https?:\/\//i.test(target)) {
    try {
      const u = new URL(target);
      path = u.pathname + u.search + u.hash;
    } catch {
      return fallback;
    }
  }
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return fallback;
  if (path.startsWith("/login") || path.startsWith("/signup")) return fallback;
  return path;
}
