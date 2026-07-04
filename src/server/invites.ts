"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGroupWithMembers } from "@/server/groups";
import type { GroupInviteLink, InvitePreview } from "@/types/database";

const DEFAULT_EXPIRES_DAYS = 7;

async function requireGroupAdmin(groupId: string) {
  const groupData = await getGroupWithMembers(groupId);
  if (!groupData) {
    return null;
  }

  const currentMember = groupData.members.find(
    (member) => member.user_id === groupData.currentUserId
  );

  if (currentMember?.role !== "admin") {
    return null;
  }

  return groupData;
}

export async function getGroupInviteLinks(groupId: string): Promise<GroupInviteLink[]> {
  const groupData = await requireGroupAdmin(groupId);
  if (!groupData) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_invite_links")
    .select("id, group_id, token, expires_at, uses_count, max_uses, is_active, created_at")
    .eq("group_id", groupId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getGroupInviteLinks failed", error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data as GroupInviteLink[];
}

export type InviteActionState = {
  error: string | null;
  success: string | null;
};

export async function createGroupInviteLinkAction(
  groupId: string,
  _prevState: InviteActionState,
  _formData: FormData
): Promise<InviteActionState> {
  void _formData;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "צריך להתחבר כדי ליצור לינק הזמנה", success: null };
  }

  const groupData = await requireGroupAdmin(groupId);
  if (!groupData) {
    return { error: "אין הרשאה ליצור לינק הזמנה", success: null };
  }

  const { error } = await supabase.rpc("create_group_invite_link", {
    p_group_id: groupId,
    p_expires_days: DEFAULT_EXPIRES_DAYS,
  });

  if (error) {
    console.error("createGroupInviteLinkAction failed", error);
    return { error: "לא הצלחנו ליצור לינק הזמנה. נסו שוב.", success: null };
  }

  revalidatePath(`/groups/${groupId}`);

  return { error: null, success: "לינק ההזמנה נוצר בהצלחה" };
}

export async function revokeGroupInviteLinkAction(
  groupId: string,
  inviteLinkId: string,
  _prevState: InviteActionState,
  _formData: FormData
): Promise<InviteActionState> {
  void _formData;

  const groupData = await requireGroupAdmin(groupId);
  if (!groupData) {
    return { error: "אין הרשאה לבטל לינק הזמנה", success: null };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("group_invite_links")
    .update({
      is_active: false,
      revoked_at: new Date().toISOString(),
    })
    .eq("id", inviteLinkId)
    .eq("group_id", groupId)
    .eq("is_active", true);

  if (error) {
    return { error: "לא הצלחנו לבטל את לינק ההזמנה. נסו שוב.", success: null };
  }

  revalidatePath(`/groups/${groupId}`);

  return { error: null, success: "לינק ההזמנה בוטל" };
}

type InvitePreviewRow = {
  group_id?: string;
  group_name?: string;
  is_valid?: boolean;
  valid?: boolean;
};

export async function getInvitePreview(token: string): Promise<InvitePreview | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_group_invite_preview", {
    p_token: token,
  });

  if (error || !data) {
    return null;
  }

  const preview = (Array.isArray(data) ? data[0] : data) as InvitePreviewRow | null;
  if (!preview?.group_id || !preview.group_name) {
    return null;
  }

  const isValid = preview.is_valid ?? preview.valid ?? true;
  if (!isValid) {
    return null;
  }

  return {
    group_id: preview.group_id,
    group_name: preview.group_name,
  };
}

export type AcceptInviteState = {
  error: string | null;
};

export async function acceptInviteAction(
  token: string,
  _prevState: AcceptInviteState,
  _formData: FormData
): Promise<AcceptInviteState> {
  void _formData;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "צריך להתחבר כדי להצטרף לקבוצה" };
  }

  const { data, error } = await supabase.rpc("accept_group_invite_link", {
    p_token: token,
  });

  if (error) {
    return { error: "לא הצלחנו לצרף אותך לקבוצה. נסו שוב." };
  }

  const result = (Array.isArray(data) ? data[0] : data) as { group_id?: string } | null;
  const groupId = result?.group_id;

  if (!groupId) {
    const preview = await getInvitePreview(token);
    if (preview?.group_id) {
      redirect(`/groups/${preview.group_id}`);
    }
    return { error: "לא הצלחנו לצרף אותך לקבוצה. נסו שוב." };
  }

  redirect(`/groups/${groupId}`);
}
