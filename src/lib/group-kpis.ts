export type GroupKpiTotals = {
  owedToMeCents: number;
  iOweCents: number;
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

  return { owedToMeCents, iOweCents };
}
