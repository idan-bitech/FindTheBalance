import type { Profile } from "@/types/database";

export function normalizeProfile(
  profiles: Profile | Profile[] | (Profile | null)[] | null
): Profile | null {
  if (!profiles) {
    return null;
  }

  if (Array.isArray(profiles)) {
    return profiles.find((profile): profile is Profile => profile !== null) ?? null;
  }

  return profiles;
}
