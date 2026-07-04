const DEFAULT_REDIRECT = "/dashboard";

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
