/**
 * Backend API base URL (set on Vercel: NEXT_PUBLIC_API_URL = your Render backend URL).
 * Empty string = same origin (single-app or local dev with proxy).
 */
export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  }
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
}

/** Use for fetch: getApiUrl() + "/api/config" etc. */
export function apiPath(path: string): string {
  const base = getApiUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

/**
 * Image URL: backend uploads are at /uploaded/* on the API origin; frontend public is same origin.
 */
export function getImageUrl(image: string | undefined): string {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  if (image.startsWith("/uploaded/")) return apiPath(image);
  return image;
}
