import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";
import type { Group, Profile } from "@/types/database";

type GroupPageProps = {
  params: Promise<{ groupId: string }>;
};

type MemberRow = {
  role: string;
  status: string;
  profiles: Profile | Profile[] | null;
};

function normalizeProfile(profiles: Profile | Profile[] | null): Profile | null {
  if (!profiles) {
    return null;
  }

  return Array.isArray(profiles) ? (profiles[0] ?? null) : profiles;
}

function extractMembers(members: MemberRow[] | null) {
  if (!members) {
    return [];
  }

  return members.map((member) => ({
    role: member.role,
    status: member.status,
    profiles: normalizeProfile(member.profiles),
  }));
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { groupId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, name, description, currency, created_by, created_at")
    .eq("id", groupId)
    .maybeSingle();

  if (groupError || !group) {
    redirect("/dashboard");
  }

  const typedGroup = group as Group;

  const { data: members, error: membersError } = await supabase
    .from("group_members")
    .select(
      `
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

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-right">
      <section className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-neutral-500 hover:text-neutral-800"
          >
            חזרה ללוח הבקרה
          </Link>
          <LogoutButton />
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-neutral-200">
            <h1 className="mb-2 text-3xl font-bold text-neutral-950">{typedGroup.name}</h1>
            {typedGroup.description ? (
              <p className="text-neutral-600">{typedGroup.description}</p>
            ) : null}
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-neutral-200">
            <h2 className="mb-4 text-xl font-bold text-neutral-950">חברי הקבוצה</h2>

            {activeMembers.length === 0 ? (
              <p className="text-neutral-600">אין חברים פעילים בקבוצה</p>
            ) : (
              <ul className="space-y-3">
                {activeMembers.map((member, index) => (
                  <li
                    key={`${member.profiles?.id ?? "member"}-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-neutral-200 px-5 py-3"
                  >
                    <span className="font-medium text-neutral-950">
                      {member.profiles?.display_name ?? "משתמש"}
                    </span>
                    <span className="text-sm text-neutral-500">{member.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-3xl bg-neutral-100 p-8 text-center ring-1 ring-neutral-200">
            <p className="text-neutral-700">בשלב הבא נוסיף הוצאות וחישוב חובות</p>
          </div>
        </div>
      </section>
    </main>
  );
}
