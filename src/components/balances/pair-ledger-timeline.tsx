import {
  formatEntryDate,
  formatLedgerEntryDescription,
  formatLedgerSourceType,
  formatSettlementDirection,
} from "@/lib/balance-display";
import type { PairLedgerEntry } from "@/server/settlements";

type PairLedgerTimelineProps = {
  entries: PairLedgerEntry[];
  currentUserId: string;
  friendName: string;
};

export function PairLedgerTimeline({
  entries,
  currentUserId,
  friendName,
}: PairLedgerTimelineProps) {
  if (entries.length === 0) {
    return <p className="text-neutral-600">אין היסטוריה עדיין</p>;
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => {
        const settlementDirection =
          entry.source_type === "settlement"
            ? formatSettlementDirection({
                entry,
                currentUserId,
                friendName,
              })
            : null;

        return (
          <li
            key={entry.id}
            className="rounded-2xl border border-neutral-200 px-5 py-4"
          >
            <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-neutral-500">
                {formatEntryDate(entry.created_at)}
              </span>
              <span className="text-sm font-medium text-neutral-700">
                {formatLedgerSourceType(entry.source_type)}
              </span>
            </div>
            <p className="font-medium text-neutral-950">
              {formatLedgerEntryDescription({
                entry,
                currentUserId,
                friendName,
              })}
            </p>
            {settlementDirection ? (
              <p className="mt-1 text-sm text-neutral-600">{settlementDirection}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
