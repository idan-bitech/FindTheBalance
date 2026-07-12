import { getPairNetBalance } from "@/domain/debt";
import { createClient } from "@/lib/supabase/server";
import type { GroupMemberWithProfile, MemberBalance } from "@/types/database";

/**
 * Takes the group's already-fetched members and current user id (the caller
 * must have already validated access, e.g. via getGroupWithMembers) instead
 * of re-fetching them, to avoid a redundant auth + group/members round-trip
 * on every group page load.
 */
export async function getMyGroupBalances(
  groupId: string,
  members: GroupMemberWithProfile[],
  currentUserId: string
): Promise<MemberBalance[]> {
  const otherMembers = members.filter((member) => member.user_id !== currentUserId);

  if (otherMembers.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data: entries, error } = await supabase
    .from("ledger_entries")
    .select("from_user_id, to_user_id, amount_cents")
    .eq("group_id", groupId)
    .eq("is_void", false);

  if (error || !entries) {
    return [];
  }

  return otherMembers.map((member) => ({
    userId: member.user_id,
    displayName: member.profiles?.display_name ?? "משתמש",
    netAmountCents: getPairNetBalance({
      entries,
      userAId: currentUserId,
      userBId: member.user_id,
    }),
  }));
}
