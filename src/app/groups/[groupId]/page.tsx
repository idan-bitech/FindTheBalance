import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { PageCard, PageSection } from "@/components/app/page-card";
import { FriendBalanceRow } from "@/components/balances/friend-balance-row";
import { EventListItem } from "@/components/events/event-list-item";
import { GroupInviteLinks } from "@/components/groups/group-invite-links";
import { buttonPrimaryClassName } from "@/lib/ui-classes";
import { hasOpenDebts } from "@/lib/balance-display";
import { getMyGroupBalances } from "@/server/balances";
import { getGroupEvents } from "@/server/events";
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

  const [events, balances, inviteLinks] = await Promise.all([
    getGroupEvents(groupId),
    getMyGroupBalances(groupId),
    isAdmin ? getGroupInviteLinks(groupId) : Promise.resolve([]),
  ]);

  const openDebts = hasOpenDebts(balances);
  const openBalances = balances.filter((balance) => balance.netAmountCents !== 0);

  return (
    <AppShell backHref="/dashboard" backLabel="חזרה ללוח הבקרה">
      <PageSection>
        <PageCard>
          <h1 className="mb-2 text-2xl font-bold text-neutral-950 sm:text-3xl">{group.name}</h1>
          {group.description ? (
            <p className="mb-5 text-neutral-600">{group.description}</p>
          ) : (
            <div className="mb-5" />
          )}
          <Link href={`/groups/${groupId}/events/new`} className={buttonPrimaryClassName}>
            הוספת הוצאה
          </Link>
        </PageCard>

        <PageCard>
          <h2 className="mb-4 text-lg font-bold text-neutral-950 sm:text-xl">יתרות מול חברים</h2>

          {balances.length === 0 ? (
            <p className="text-neutral-600">אין חברים נוספים בקבוצה לחישוב יתרות</p>
          ) : !openDebts ? (
            <p className="rounded-2xl bg-neutral-50 px-4 py-4 text-neutral-700">
              אין חובות פתוחים בקבוצה כרגע
            </p>
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
          <h2 className="mb-4 text-lg font-bold text-neutral-950 sm:text-xl">חברי הקבוצה</h2>

          {members.length === 0 ? (
            <p className="text-neutral-600">אין חברים פעילים בקבוצה</p>
          ) : (
            <ul className="mb-6 space-y-3">
              {members.map((member) => (
                <li
                  key={member.user_id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 px-4 py-3"
                >
                  <span className="font-medium text-neutral-950">
                    {member.profiles?.display_name ?? "משתמש"}
                  </span>
                  <span className="shrink-0 text-sm text-neutral-500">{member.role}</span>
                </li>
              ))}
            </ul>
          )}

          <AddMemberForm groupId={groupId} />
        </PageCard>

        <PageCard>
          <h2 className="mb-4 text-lg font-bold text-neutral-950 sm:text-xl">הוצאות אחרונות</h2>

          {events.length === 0 ? (
            <p className="text-neutral-600">עדיין לא נוספו הוצאות בקבוצה</p>
          ) : (
            <ul className="space-y-3">
              {events.map((event) => (
                <EventListItem key={event.id} groupId={groupId} event={event} />
              ))}
            </ul>
          )}
        </PageCard>

        {isAdmin ? (
          <PageCard subdued>
            <h2 className="mb-4 text-lg font-bold text-neutral-950">הזמנה לקבוצה</h2>
            <GroupInviteLinks groupId={groupId} inviteLinks={inviteLinks} />
          </PageCard>
        ) : null}
      </PageSection>
    </AppShell>
  );
}
