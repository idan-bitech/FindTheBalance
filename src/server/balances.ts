import { getPairNetBalance } from "@/domain/debt";
import { createClient } from "@/lib/supabase/server";
import { getGroupWithMembers } from "@/server/groups";
import type { MemberBalance } from "@/types/database";

export async function getMyGroupBalances(groupId: string): Promise<MemberBalance[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const groupData = await getGroupWithMembers(groupId);
  if (!groupData) {
    return [];
  }

  const otherMembers = groupData.members.filter((member) => member.user_id !== user.id);

  if (otherMembers.length === 0) {
    return [];
  }

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
      userAId: user.id,
      userBId: member.user_id,
    }),
  }));
}
