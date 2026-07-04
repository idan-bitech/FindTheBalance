import type { ReactNode } from "react";

type GroupKpiCardTone = "green" | "amber";

const toneClasses: Record<GroupKpiCardTone, { card: string; label: string; amount: string }> = {
  green: {
    card: "border-emerald-300 bg-emerald-50",
    label: "text-emerald-600",
    amount: "text-emerald-700",
  },
  amber: {
    card: "border-amber-300 bg-amber-50",
    label: "text-amber-600",
    amount: "text-amber-700",
  },
};

type GroupKpiCardProps = {
  label: string;
  value: ReactNode;
  tone: GroupKpiCardTone;
};

export function GroupKpiCard({ label, value, tone }: GroupKpiCardProps) {
  const toneClass = toneClasses[tone];

  return (
    <div className={`rounded-2xl border p-5 ${toneClass.card}`}>
      <p className={`text-sm font-medium ${toneClass.label}`}>{label}</p>
      <p className={`mt-1.5 text-2xl font-bold sm:text-3xl ${toneClass.amount}`}>{value}</p>
    </div>
  );
}
