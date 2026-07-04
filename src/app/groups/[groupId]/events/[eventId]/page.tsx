import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { PageCard, PageSection } from "@/components/app/page-card";
import { CancelEventForm } from "@/components/events/cancel-event-form";
import { formatEntryDate } from "@/lib/balance-display";
import { formatILS } from "@/domain/money";
import { canCancelEvent, getEventDetail } from "@/server/events";
import { getGroupWithMembers } from "@/server/groups";

type EventDetailPageProps = {
  params: Promise<{ groupId: string; eventId: string }>;
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { groupId, eventId } = await params;

  const groupData = await getGroupWithMembers(groupId);
  if (!groupData) {
    redirect("/dashboard");
  }

  const event = await getEventDetail(groupId, eventId);
  if (!event) {
    redirect(`/groups/${groupId}`);
  }

  const isCancelled = event.status === "cancelled";
  const payerName = event.payer?.display_name ?? "משתמש";
  const showCancelForm = !isCancelled && (await canCancelEvent(groupId, eventId));

  const nonPayerEntries = event.ledgerEntries.filter(
    (entry) => entry.from_user_id !== event.paid_by_user_id
  );

  return (
    <AppShell backHref={`/groups/${groupId}`} backLabel={`חזרה ל${groupData.group.name}`}>
      <PageSection>
        <PageCard>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-stone-950 sm:text-3xl">{event.title}</h1>
            {isCancelled ? (
              <span className="rounded-full bg-stone-200 px-3 py-1 text-sm font-medium text-stone-700">
                הוצאה מבוטלת
              </span>
            ) : null}
          </div>

          <p className="mb-1 text-2xl font-bold text-stone-950">
            {formatILS(event.total_amount_cents)}
          </p>
          <p className="mb-4 text-stone-600">{formatEntryDate(event.event_date)}</p>

          {isCancelled ? (
            <p className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
              ההוצאה נשמרה בהיסטוריה אך אינה משפיעה על היתרות.
            </p>
          ) : null}

          {event.description ? (
            <p className="mt-4 text-stone-600">{event.description}</p>
          ) : null}
        </PageCard>

        <PageCard>
          <h2 className="mb-4 text-lg font-bold text-stone-950 sm:text-xl">פרטים</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-stone-500">שילם</dt>
              <dd className="font-medium text-stone-950">שולם על ידי {payerName}</dd>
            </div>
            <div>
              <dt className="mb-2 text-sm text-stone-500">משתתפים</dt>
              <dd>
                <ul className="space-y-2">
                  {event.participants.map((participant) => (
                    <li
                      key={participant.user_id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 px-4 py-3"
                    >
                      <span className="text-stone-950">
                        {participant.profile?.display_name ?? "משתמש"}
                      </span>
                      <span className="shrink-0 text-sm font-medium text-stone-700">
                        {formatILS(participant.share_amount_cents)}
                      </span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </PageCard>

        <PageCard>
          <h2 className="mb-4 text-lg font-bold text-stone-950 sm:text-xl">השפעה על יתרות</h2>

          {nonPayerEntries.length === 0 ? (
            <EmptyState title="אין השפעה על יתרות בין חברים" />
          ) : (
            <ul className="space-y-2">
              {nonPayerEntries.map((entry) => {
                const participant = event.participants.find(
                  (p) => p.user_id === entry.from_user_id
                );
                const participantName = participant?.profile?.display_name ?? "משתמש";

                return (
                  <li
                    key={entry.id}
                    className={`rounded-xl border px-4 py-3 ${
                      entry.is_void
                        ? "border-stone-200 bg-stone-50 text-stone-500 line-through"
                        : "border-stone-200"
                    }`}
                  >
                    {participantName} חייב ל{payerName} {formatILS(entry.amount_cents)}
                  </li>
                );
              })}
            </ul>
          )}
        </PageCard>

        {showCancelForm ? (
          <CancelEventForm groupId={groupId} eventId={eventId} />
        ) : null}
      </PageSection>
    </AppShell>
  );
}
