/**
 * Convert shekel input to integer agorot (cents).
 * ₪120.50 → 12050
 */
export function shekelToAgorot(value: string | number): number {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.round(value * 100);
  }

  const normalized = value
    .trim()
    .replace(/₪\s?/g, "")
    .replace(/,/g, "")
    .replace(/\s/g, "");

  if (!normalized || normalized === ".") {
    return 0;
  }

  const [wholePart, fractionPart = ""] = normalized.split(".");
  const whole = Number.parseInt(wholePart || "0", 10);
  const fraction = fractionPart.padEnd(2, "0").slice(0, 2);
  const agorot = Number.parseInt(fraction || "0", 10);

  if (Number.isNaN(whole) || Number.isNaN(agorot)) {
    return 0;
  }

  return whole * 100 + agorot;
}

export function agorotToShekel(amountCents: number): number {
  return amountCents / 100;
}

export function formatILS(amountCents: number): string {
  const shekels = amountCents / 100;
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(shekels);
}
