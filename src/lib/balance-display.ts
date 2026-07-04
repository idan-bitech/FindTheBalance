import { formatILS } from "@/domain/money";

export function formatBalanceMainText(displayName: string, netAmountCents: number): string {
  if (netAmountCents > 0) {
    return `${displayName} חייב לך ${formatILS(netAmountCents)}`;
  }
  if (netAmountCents < 0) {
    return `אתה חייב ל${displayName} ${formatILS(Math.abs(netAmountCents))}`;
  }
  return `אין חוב פתוח מול ${displayName}`;
}

export function formatBalanceSecondaryText(netAmountCents: number): string | null {
  if (netAmountCents === 0) {
    return "ההתחשבנות ביניכם מאוזנת כרגע";
  }
  return null;
}

export function formatPairSummaryMain(netAmountCents: number): string {
  if (netAmountCents > 0) {
    return `חייב לך ${formatILS(netAmountCents)}`;
  }
  if (netAmountCents < 0) {
    return `אתה חייב ${formatILS(Math.abs(netAmountCents))}`;
  }
  return "אין חוב פתוח ביניכם";
}

export function formatPairSummarySecondary(netAmountCents: number): string | null {
  if (netAmountCents === 0) {
    return "כל החובות ביניכם סגורים כרגע. ההיסטוריה נשמרת למטה.";
  }
  return null;
}

export function formatShekelInput(amountCents: number): string {
  return (Math.abs(amountCents) / 100).toFixed(2);
}

export function formatLedgerSourceType(sourceType: string): string {
  switch (sourceType) {
    case "event":
      return "הוצאה";
    case "settlement":
      return "סגירת חוב";
    case "adjustment":
      return "התאמה";
    default:
      return sourceType;
  }
}

export function formatLedgerEntryDescription({
  entry,
  currentUserId,
  friendName,
}: {
  entry: {
    source_type: string;
    from_user_id: string;
    to_user_id: string;
    amount_cents: number;
  };
  currentUserId: string;
  friendName: string;
}): string {
  if (entry.source_type === "settlement") {
    return `סגירת חוב בסך ${formatILS(entry.amount_cents)}`;
  }

  if (entry.source_type === "event") {
    if (entry.from_user_id !== currentUserId && entry.to_user_id === currentUserId) {
      return `${friendName} חייב לך ${formatILS(entry.amount_cents)} בעקבות הוצאה`;
    }
    if (entry.from_user_id === currentUserId && entry.to_user_id !== currentUserId) {
      return `אתה חייב ל${friendName} ${formatILS(entry.amount_cents)} בעקבות הוצאה`;
    }
  }

  if (entry.from_user_id !== currentUserId && entry.to_user_id === currentUserId) {
    return `${friendName} חייב לך ${formatILS(entry.amount_cents)}`;
  }

  if (entry.from_user_id === currentUserId && entry.to_user_id !== currentUserId) {
    return `אתה חייב ל${friendName} ${formatILS(entry.amount_cents)}`;
  }

  return formatILS(entry.amount_cents);
}

export function formatSettlementDirection({
  entry,
  currentUserId,
  friendName,
}: {
  entry: {
    from_user_id: string;
    to_user_id: string;
  };
  currentUserId: string;
  friendName: string;
}): string | null {
  if (entry.from_user_id === currentUserId && entry.to_user_id !== currentUserId) {
    return `${friendName} שילם לך`;
  }
  if (entry.from_user_id !== currentUserId && entry.to_user_id === currentUserId) {
    return `סימנת ששילמת ל${friendName}`;
  }
  return null;
}

export function formatEntryDate(date: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function hasOpenDebts(balances: { netAmountCents: number }[]): boolean {
  return balances.some((balance) => balance.netAmountCents !== 0);
}
