import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { PageCard } from "@/components/app/page-card";
import { getGroupWithMembers } from "@/server/groups";
import { CreateEventForm } from "./create-event-form";

type NewEventPageProps = {
  params: Promise<{ groupId: string }>;
};

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function NewEventPage({ params }: NewEventPageProps) {
  const { groupId } = await params;
  const groupData = await getGroupWithMembers(groupId);

  if (!groupData) {
    redirect("/dashboard");
  }

  const { members, group } = groupData;

  if (members.length === 0) {
    redirect(`/groups/${groupId}`);
  }

  return (
    <AppShell
      backHref={`/groups/${groupId}`}
      backLabel={`חזרה ל${group.name}`}
      maxWidth="md"
    >
      <PageCard>
        <h1 className="mb-2 text-2xl font-bold text-neutral-950 sm:text-3xl">הוספת הוצאה</h1>
        <p className="mb-6 text-neutral-600">הזינו פרטי הוצאה וחלקו בין המשתתפים</p>

        <CreateEventForm
          groupId={groupId}
          members={members}
          defaultDate={getTodayDateString()}
        />
      </PageCard>
    </AppShell>
  );
}
