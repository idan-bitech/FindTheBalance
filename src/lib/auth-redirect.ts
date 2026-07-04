const DEFAULT_REDIRECT = "/dashboard";
const DEFAULT_SITE_URL = "http://localhost:3000";

/**
 * Resolves the site's public origin for building auth redirect URLs
 * (e.g. Supabase's emailRedirectTo). Prefers NEXT_PUBLIC_SITE_URL so
 * production always points at the deployed domain; falls back to
 * window.location.origin in the browser, and to localhost otherwise
 * (e.g. during server-side rendering without the env var set).
 */
export function getSiteUrl(): string {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envSiteUrl) {
    return envSiteUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return DEFAULT_SITE_URL;
}

export function getSafeRedirectPath(next: string | null | undefined): string {
  if (!next) {
    return DEFAULT_REDIRECT;
  }

  const trimmed = next.trim();

  if (
    trimmed.includes("://") ||
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//")
  ) {
    return DEFAULT_REDIRECT;
  }

  return trimmed;
}

export function buildAuthHref(path: "/login" | "/register", next?: string | null): string {
  const safeNext = next ? getSafeRedirectPath(next) : null;

  if (!safeNext || safeNext === DEFAULT_REDIRECT) {
    return path;
  }

  return `${path}?next=${encodeURIComponent(safeNext)}`;
}
