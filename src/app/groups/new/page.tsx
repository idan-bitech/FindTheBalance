import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { PageCard } from "@/components/app/page-card";
import { CreateGroupForm } from "./create-group-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewGroupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell backHref="/dashboard" backLabel="חזרה ללוח הבקרה" maxWidth="md">
      <PageCard>
        <h1 className="mb-2 text-2xl font-bold text-neutral-950 sm:text-3xl">יצירת קבוצה חדשה</h1>
        <p className="mb-6 text-neutral-600">הגדירו שם ותיאור לקבוצה החדשה</p>
        <CreateGroupForm />
      </PageCard>
    </AppShell>
  );
}
