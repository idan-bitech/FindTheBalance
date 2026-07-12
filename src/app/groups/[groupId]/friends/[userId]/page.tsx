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
import { createClient } from "@/lib/supabase/server";
import { getGroupWithMembers } from "@/server/groups";
import { getPairPageData } from "@/server/settlements";

type PairDetailPageProps = {
  params: Promise<{ groupId: string; userId: string }>;
};

export default async function PairDetailPage({ params }: PairDetailPageProps) {
  const { groupId, userId: friendUserId } = await params;

  const [groupData, pairData] = await Promise.all([
    getGroupWithMembers(groupId),
    getPairPageData(groupId, friendUserId),
  ]);

  if (!groupData) {
    redirect("/dashboard");
  }

  if (!pairData) {
    redirect(`/groups/${groupId}`);
  }

  const supabase = await createClient();
  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("display_name, pronoun_preference")
    .eq("id", groupData.currentUserId)
    .maybeSingle();

  const friendName = pairData.friend.display_name ?? "משתמש";
  const { netAmountCents, entries } = pairData;
  const summarySecondary = formatPairSummarySecondary(netAmountCents);

  return (
    <AppShell backHref={`/groups/${groupId}`} backLabel={`חזרה ל${groupData.group.name}`}>
      <PageSection>
        <PageCard>
          <h1 className="mb-2 text-2xl font-bold text-stone-950 sm:text-3xl">{friendName}</h1>
          <p className="text-lg font-medium text-stone-950">
            {formatPairSummaryMain(netAmountCents)}
          </p>
          {summarySecondary ? (
            <p className="mt-2 text-stone-600">{summarySecondary}</p>
          ) : null}
        </PageCard>

        {netAmountCents !== 0 ? (
          <SettlementForm
            groupId={groupId}
            friendUserId={friendUserId}
            friendName={friendName}
            netAmountCents={netAmountCents}
            creditorDisplayName={currentUserProfile?.display_name ?? "משתמש"}
            creditorPronounPreference={currentUserProfile?.pronoun_preference}
          />
        ) : (
          <BalancedStateCard />
        )}

        <PageCard>
          <h2 className="mb-4 text-lg font-bold text-stone-950 sm:text-xl">היסטוריית התחשבנות</h2>
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
