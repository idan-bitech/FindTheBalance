import { formatILS } from "@/domain/money";

export type GroupKpiTotals = {
  owedToMeCents: number;
  iOweCents: number;
  netCents: number;
};

export function computeGroupKpiTotals(
  balances: { netAmountCents: number }[]
): GroupKpiTotals {
  let owedToMeCents = 0;
  let iOweCents = 0;

  for (const balance of balances) {
    if (balance.netAmountCents > 0) {
      owedToMeCents += balance.netAmountCents;
    } else if (balance.netAmountCents < 0) {
      iOweCents += Math.abs(balance.netAmountCents);
    }
  }

  return {
    owedToMeCents,
    iOweCents,
    netCents: owedToMeCents - iOweCents,
  };
}

export function formatNetKpiText(netCents: number): string {
  if (netCents > 0) {
    return `לטובתך ${formatILS(netCents)}`;
  }
  if (netCents < 0) {
    return `לחובתך ${formatILS(Math.abs(netCents))}`;
  }
  return "מאוזן";
}

export function formatContributionPercentText(
  myPaidAmountCents: number,
  totalGroupExpensesCents: number
): string {
  if (totalGroupExpensesCents === 0) {
    return "אין נתונים עדיין";
  }

  const percent = Math.round((myPaidAmountCents / totalGroupExpensesCents) * 100);
  return `${percent}%`;
}
