import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { PageCard, PageSection } from "@/components/app/page-card";
import { FriendBalanceRow } from "@/components/balances/friend-balance-row";
import { EventListItem } from "@/components/events/event-list-item";
import { GroupInviteLinks } from "@/components/groups/group-invite-links";
import { GroupKpiCard } from "@/components/groups/group-kpi-card";
import { buttonPrimaryClassName } from "@/lib/ui-classes";
import { hasOpenDebts } from "@/lib/balance-display";
import { formatMemberRole } from "@/lib/member-role";
import { formatILS } from "@/domain/money";
import {
  computeGroupKpiTotals,
  formatContributionPercentText,
  formatNetKpiText,
} from "@/lib/group-kpis";
import { getMyGroupBalances } from "@/server/balances";
import { getGroupContributionSummary, getGroupEvents } from "@/server/events";
import { getGroupWithMembers } from "@/server/groups";
import { getGroupInviteLinks } from "@/server/invites";
import { AddMemberForm } from "./add-member-form";

type GroupPageProps = {
  params: Promise<{ groupId: string }>;
};

export default async function GroupPage({ params }: GroupPageProps) {
  const { groupId } = await params;
  const groupData = await getGroupWithMembers(groupId);

  if (!groupData) {
    redirect("/dashboard");
  }

  const { group, members, currentUserId } = groupData;
  const currentMember = members.find((member) => member.user_id === currentUserId);
  const isAdmin = currentMember?.role === "admin";

  const [events, balances, inviteLinks, contribution] = await Promise.all([
    getGroupEvents(groupId),
    getMyGroupBalances(groupId),
    isAdmin ? getGroupInviteLinks(groupId) : Promise.resolve([]),
    getGroupContributionSummary(groupId, currentUserId),
  ]);

  const openDebts = hasOpenDebts(balances);
  const openBalances = balances.filter((balance) => balance.netAmountCents !== 0);
  const kpiTotals = computeGroupKpiTotals(balances);

  return (
    <AppShell backHref="/dashboard" backLabel="חזרה למסך הראשי">
      <PageSection>
        <PageCard>
          <h1 className="mb-2 text-2xl font-bold text-stone-950 sm:text-3xl">{group.name}</h1>
          {group.description ? (
            <p className="mb-5 text-stone-600">{group.description}</p>
          ) : (
            <div className="mb-5" />
          )}
          <Link href={`/groups/${groupId}/events/new`} className={buttonPrimaryClassName}>
            הוספת הוצאה
          </Link>
        </PageCard>

        <PageCard>
          <h2 className="mb-4 text-lg font-bold text-stone-950 sm:text-xl">הסיכום שלי בקבוצה</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <GroupKpiCard label="חייבים לי" value={formatILS(kpiTotals.owedToMeCents)} tone="green" />
            <GroupKpiCard label="אני חייב" value={formatILS(kpiTotals.iOweCents)} tone="amber" />
            <GroupKpiCard label="נטו" value={formatNetKpiText(kpiTotals.netCents)} tone="stone" />
            <GroupKpiCard
              label="התרומה שלי"
              value={formatContributionPercentText(
                contribution.myPaidAmountCents,
                contribution.totalGroupExpensesCents
              )}
              tone="violet"
            />
          </div>
        </PageCard>

        <PageCard>
          <h2 className="mb-4 text-lg font-bold text-stone-950 sm:text-xl">יתרות מול חברים</h2>

          {balances.length === 0 ? (
            <EmptyState title="אין חברים נוספים בקבוצה לחישוב יתרות" />
          ) : !openDebts ? (
            <EmptyState boxed title="אין חובות פתוחים בקבוצה כרגע" />
          ) : (
            <ul className="space-y-3">
              {openBalances.map((balance) => (
                <FriendBalanceRow
                  key={balance.userId}
                  groupId={groupId}
                  userId={balance.userId}
                  displayName={balance.displayName}
                  netAmountCents={balance.netAmountCents}
                />
              ))}
            </ul>
          )}
        </PageCard>

        <PageCard>
          <h2 className="mb-4 text-lg font-bold text-stone-950 sm:text-xl">הוצאות אחרונות</h2>

          {events.length === 0 ? (
            <EmptyState title="עדיין לא נוספו הוצאות בקבוצה" />
          ) : (
            <ul className="space-y-3">
              {events.map((event) => (
                <EventListItem key={event.id} groupId={groupId} event={event} />
              ))}
            </ul>
          )}
        </PageCard>

        <PageCard>
          <h2 className="mb-4 text-lg font-bold text-stone-950 sm:text-xl">חברי הקבוצה</h2>

          {members.length === 0 ? (
            <EmptyState title="אין חברים פעילים בקבוצה" />
          ) : (
            <ul className="mb-6 space-y-3">
              {members.map((member) => (
                <li
                  key={member.user_id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 px-4 py-3"
                >
                  <span className="font-medium text-stone-950">
                    {member.profiles?.display_name ?? "משתמש"}
                  </span>
                  <span className="shrink-0 text-sm text-stone-500">
                    {formatMemberRole(member.role)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <AddMemberForm groupId={groupId} />
        </PageCard>

        {isAdmin ? (
          <PageCard subdued>
            <h2 className="mb-4 text-lg font-bold text-stone-950">הזמנה לקבוצה</h2>
            <GroupInviteLinks groupId={groupId} inviteLinks={inviteLinks} />
          </PageCard>
        ) : null}
      </PageSection>
    </AppShell>
  );
}
