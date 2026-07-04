type GroupKpiCardTone = "green" | "amber" | "stone" | "violet";

const toneClasses: Record<GroupKpiCardTone, string> = {
  green: "border-emerald-100 bg-emerald-50 text-emerald-900",
  amber: "border-amber-100 bg-amber-50 text-amber-900",
  stone: "border-stone-200 bg-stone-100 text-stone-900",
  violet: "border-violet-100 bg-violet-50 text-violet-900",
};

type GroupKpiCardProps = {
  label: string;
  value: string;
  tone: GroupKpiCardTone;
};

export function GroupKpiCard({ label, value, tone }: GroupKpiCardProps) {
  return (
    <div className={`rounded-2xl border p-4 ${toneClasses[tone]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
