import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { PageCard, PageSection } from "@/components/app/page-card";
import { BalancedStateCard } from "@/components/balances/balanced-state-card";
import { PairLedgerTimeline } from "@/components/balances/pair-ledger-timeline";
import { SettlementForm } from "@/components/settlements/settlement-form";
import {
  formatPairSummaryMain,
  formatPairSummarySecondary,
} from "@/lib/balance-display";
import { getGroupWithMembers } from "@/server/groups";
import { getPairBalance, getPairLedgerEntries } from "@/server/settlements";

type PairDetailPageProps = {
  params: Promise<{ groupId: string; userId: string }>;
};

export default async function PairDetailPage({ params }: PairDetailPageProps) {
  const { groupId, userId: friendUserId } = await params;

  const groupData = await getGroupWithMembers(groupId);
  if (!groupData) {
    redirect("/dashboard");
  }

  const [pairBalance, entries] = await Promise.all([
    getPairBalance(groupId, friendUserId),
    getPairLedgerEntries(groupId, friendUserId),
  ]);

  if (!pairBalance) {
    redirect(`/groups/${groupId}`);
  }

  const friendName = pairBalance.friend.display_name ?? "משתמש";
  const { netAmountCents } = pairBalance;
  const summarySecondary = formatPairSummarySecondary(netAmountCents);

  return (
    <AppShell backHref={`/groups/${groupId}`} backLabel={`חזרה ל${groupData.group.name}`}>
      <PageSection>
        <PageCard>
          <h1 className="mb-2 text-2xl font-bold text-neutral-950 sm:text-3xl">{friendName}</h1>
          <p className="text-lg font-medium text-neutral-950">
            {formatPairSummaryMain(friendName, netAmountCents)}
          </p>
          {summarySecondary ? (
            <p className="mt-2 text-neutral-600">{summarySecondary}</p>
          ) : null}
        </PageCard>

        {netAmountCents !== 0 ? (
          <SettlementForm
            groupId={groupId}
            friendUserId={friendUserId}
            friendName={friendName}
            netAmountCents={netAmountCents}
          />
        ) : (
          <BalancedStateCard />
        )}

        <PageCard>
          <h2 className="mb-4 text-lg font-bold text-neutral-950 sm:text-xl">היסטוריה</h2>
          <PairLedgerTimeline
            entries={entries}
            currentUserId={groupData.currentUserId}
            friendName={friendName}
          />
        </PageCard>
      </PageSection>
    </AppShell>
  );
}
