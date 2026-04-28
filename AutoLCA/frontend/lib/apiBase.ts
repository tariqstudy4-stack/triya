/**
 * API origin for server-side or explicit full-URL fetches.
 * In the browser, prefer relative `/api/...` (Next rewrites → FastAPI).
 */
export function getApiOrigin(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  return (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
}

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const origin = getApiOrigin();
  if (!origin) return p;
  return `${origin}${p}`;
}
