"use server";

import { redirect } from "next/navigation";
import { normalizeProfile } from "@/lib/profile-utils";
import { createClient } from "@/lib/supabase/server";
import type { Group, GroupMemberWithProfile } from "@/types/database";

type MemberRow = {
  user_id: string;
  role: string;
  status: string;
  profiles: GroupMemberWithProfile["profiles"] | GroupMemberWithProfile["profiles"][] | null;
};

function extractMembers(members: MemberRow[] | null): GroupMemberWithProfile[] {
  if (!members) {
    return [];
  }

  return members.map((member) => ({
    user_id: member.user_id,
    role: member.role,
    status: member.status,
    profiles: normalizeProfile(member.profiles),
  }));
}

export async function getGroupWithMembers(groupId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: membership } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership) {
    return null;
  }

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, name, description, currency, created_by, created_at")
    .eq("id", groupId)
    .maybeSingle();

  if (groupError || !group) {
    return null;
  }

  const { data: members, error: membersError } = await supabase
    .from("group_members")
    .select(
      `
      user_id,
      role,
      status,
      profiles (
        id,
        display_name
      )
    `
    )
    .eq("group_id", groupId)
    .eq("status", "active");

  const activeMembers = membersError ? [] : extractMembers(members as MemberRow[] | null);

  return {
    group: group as Group,
    members: activeMembers,
    currentUserId: user.id,
  };
}

export type AddMemberState = {
  error: string | null;
  success: string | null;
};

export async function addMemberByEmail(
  groupId: string,
  _prevState: AddMemberState,
  formData: FormData
): Promise<AddMemberState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    return { error: "יש להזין כתובת אימייל", success: null };
  }

  const groupData = await getGroupWithMembers(groupId);
  if (!groupData) {
    return { error: "אין גישה לקבוצה", success: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .eq("email", email)
    .maybeSingle();

  if (profileError || !profile) {
    return { error: "המשתמש עדיין לא רשום במערכת", success: null };
  }

  const { data: existingMember } = await supabase
    .from("group_members")
    .select("user_id, status")
    .eq("group_id", groupId)
    .eq("user_id", profile.id)
    .maybeSingle();

  if (existingMember) {
    return { error: "המשתמש כבר חבר בקבוצה", success: null };
  }

  const { error: insertError } = await supabase.from("group_members").insert({
    group_id: groupId,
    user_id: profile.id,
    role: "member",
    status: "active",
  });

  if (insertError) {
    return { error: "לא הצלחנו להוסיף את החבר לקבוצה. נסו שוב.", success: null };
  }

  return { error: null, success: "החבר נוסף לקבוצה בהצלחה" };
}
