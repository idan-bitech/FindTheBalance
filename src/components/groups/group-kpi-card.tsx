import type { ReactNode } from "react";

type GroupKpiCardTone = "green" | "amber";

const toneClasses: Record<GroupKpiCardTone, { card: string; label: string }> = {
  green: {
    card: "border-emerald-200 bg-emerald-50 text-emerald-900",
    label: "text-emerald-700",
  },
  amber: {
    card: "border-amber-200 bg-amber-50 text-amber-900",
    label: "text-amber-700",
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
      <p className="mt-1.5 text-xl font-bold sm:text-2xl">{value}</p>
    </div>
  );
}
