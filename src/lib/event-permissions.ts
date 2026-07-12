import type { GroupMemberWithProfile } from "@/types/database";

/**
 * Pure, synchronous check — the event detail page already fetches both the
 * event (via getEventDetail) and the group's members (via
 * getGroupWithMembers), so this avoids the extra queries a server-side
 * canCancelEvent used to make to re-derive the same data.
 */
export function canUserCancelEvent(
  event: { status: string; created_by: string },
  members: GroupMemberWithProfile[],
  currentUserId: string
): boolean {
  if (event.status === "cancelled") {
    return false;
  }

  const currentMember = members.find((member) => member.user_id === currentUserId);
  const isAdmin = currentMember?.role === "admin";
  const isCreator = event.created_by === currentUserId;

  return isCreator || isAdmin;
}
