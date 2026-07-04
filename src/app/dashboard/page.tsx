import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";
import type { Group } from "@/types/database";

function extractGroups(
  memberships: { groups: Group | Group[] | null }[] | null
): Group[] {
  if (!memberships) {
    return [];
  }

  return memberships.flatMap((membership) => {
    if (!membership.groups) {
      return [];
    }

    return Array.isArray(membership.groups) ? membership.groups : [membership.groups];
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: memberships, error } = await supabase
    .from("group_members")
    .select(
      `
      groups (
        id,
        name,
        description,
        currency,
        created_by,
        created_at
      )
    `
    )
    .eq("user_id", user.id)
    .eq("status", "active");

  const groups = error ? [] : extractGroups(memberships);

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-right">
      <section className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <LogoutButton />
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-neutral-200">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-neutral-950">הקבוצות שלי</h1>
            <Link
              href="/groups/new"
              className="inline-flex justify-center rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              יצירת קבוצה חדשה
            </Link>
          </div>

          {groups.length === 0 ? (
            <div className="rounded-2xl bg-neutral-50 px-6 py-10 text-center">
              <p className="mb-2 text-lg font-semibold text-neutral-900">
                עדיין אין לכם קבוצות
              </p>
              <p className="text-neutral-600">
                צרו קבוצה חדשה כדי להתחיל לנהל התחשבנויות עם חברים
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {groups.map((group) => (
                <li key={group.id}>
                  <Link
                    href={`/groups/${group.id}`}
                    className="block rounded-2xl border border-neutral-200 px-5 py-4 transition hover:border-neutral-400 hover:bg-neutral-50"
                  >
                    <p className="font-semibold text-neutral-950">{group.name}</p>
                    {group.description ? (
                      <p className="mt-1 text-sm text-neutral-600">{group.description}</p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
