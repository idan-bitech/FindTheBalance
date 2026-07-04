"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CreateGroupState = {
  error: string | null;
};

export async function createGroup(
  _prevState: CreateGroupState,
  formData: FormData
): Promise<CreateGroupState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "").trim();

  if (!name) {
    return { error: "יש להזין שם קבוצה" };
  }

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({
      name,
      description: descriptionRaw || null,
      currency: "ILS",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (groupError || !group) {
    return { error: "יצירת הקבוצה נכשלה. נסו שוב" };
  }

  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "admin",
    status: "active",
  });

  if (memberError) {
    return { error: "יצירת הקבוצה נכשלה. נסו שוב" };
  }

  redirect(`/groups/${group.id}`);
}
