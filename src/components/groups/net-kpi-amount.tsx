type NetKpiAmountProps = {
  netCents: number;
};

export function NetKpiAmount({ netCents }: NetKpiAmountProps) {
  const sign = netCents > 0 ? "+" : netCents < 0 ? "-" : "";
  const wholeShekels = Math.round(Math.abs(netCents) / 100);
  const formattedNumber = new Intl.NumberFormat("he-IL", {
    maximumFractionDigits: 0,
  }).format(wholeShekels);

  return (
    <span dir="ltr" className="inline-flex items-baseline gap-0.5">
      <span>{sign}</span>
      <span>{formattedNumber}</span>
      <span>₪</span>
    </span>
  );
}
