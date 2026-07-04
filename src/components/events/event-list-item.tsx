import Link from "next/link";
import { formatEntryDate } from "@/lib/balance-display";
import { formatILS } from "@/domain/money";
import type { EventWithPayer } from "@/types/database";

type EventListItemProps = {
  groupId: string;
  event: EventWithPayer;
};

export function EventListItem({ groupId, event }: EventListItemProps) {
  const isCancelled = event.status === "cancelled";

  return (
    <li>
      <Link
        href={`/groups/${groupId}/events/${event.id}`}
        className={`block rounded-2xl border px-5 py-4 transition hover:border-stone-400 hover:bg-stone-50 ${
          isCancelled ? "border-stone-200 bg-stone-50 opacity-80" : "border-stone-200"
        }`}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <p className="font-semibold text-stone-950">{event.title}</p>
              {isCancelled ? (
                <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-medium text-stone-700">
                  מבוטלת
                </span>
              ) : null}
            </div>
            <p className="text-sm text-stone-500">
              {formatEntryDate(event.event_date)} · שילם {event.payer?.display_name ?? "משתמש"}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {event.participantCount} משתתפים
            </p>
          </div>
          <p className="text-lg font-bold text-stone-950">
            {formatILS(event.total_amount_cents)}
          </p>
        </div>
        {event.description ? (
          <p className="mt-2 text-sm text-stone-600">{event.description}</p>
        ) : null}
      </Link>
    </li>
  );
}
