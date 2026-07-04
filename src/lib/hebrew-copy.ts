import type { PronounPreference } from "@/types/database";

type GenderedCopy = {
  masculine: string;
  feminine: string;
  neutral: string;
};

export function genderedText(
  pronounPreference: PronounPreference | null | undefined,
  copy: GenderedCopy
): string {
  if (pronounPreference === "masculine") {
    return copy.masculine;
  }
  if (pronounPreference === "feminine") {
    return copy.feminine;
  }
  return copy.neutral;
}

export function welcomeGreeting(pronounPreference: PronounPreference | null | undefined): string {
  return genderedText(pronounPreference, {
    masculine: "ברוך הבא",
    feminine: "ברוכה הבאה",
    neutral: "ברוכים הבאים",
  });
}
