import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { PageCard, PageSection } from "@/components/app/page-card";
import { buttonPrimaryClassName } from "@/lib/ui-classes";
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
    <AppShell>
      <PageSection>
        <PageCard>
          <div className="mb-6 flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-950 sm:text-3xl">הקבוצות שלי</h1>
              <p className="mt-2 text-neutral-600">
                בחרו קבוצה כדי לראות חובות, הוצאות והתחשבנויות
              </p>
            </div>
            <Link href="/groups/new" className={buttonPrimaryClassName}>
              יצירת קבוצה חדשה
            </Link>
          </div>

          {groups.length === 0 ? (
            <EmptyState
              boxed
              title="עדיין אין לך קבוצות"
              description="צרו קבוצה ראשונה כדי להתחיל לנהל התחשבנויות"
            />
          ) : (
            <ul className="space-y-3">
              {groups.map((group) => (
                <li key={group.id}>
                  <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-neutral-950">{group.name}</p>
                      {group.description ? (
                        <p className="mt-1 text-sm text-neutral-600">{group.description}</p>
                      ) : null}
                    </div>
                    <Link
                      href={`/groups/${group.id}`}
                      className={buttonPrimaryClassName}
                    >
                      פתיחה
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PageCard>
      </PageSection>
    </AppShell>
  );
}
