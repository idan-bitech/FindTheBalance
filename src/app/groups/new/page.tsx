import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
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
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-right">
      <section className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between gap-4">
          <LogoutButton />
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-neutral-200">
          <h1 className="mb-2 text-3xl font-bold text-neutral-950">יצירת קבוצה חדשה</h1>
          <p className="mb-8 text-neutral-600">הגדירו שם ותיאור לקבוצה החדשה</p>

          <CreateGroupForm />
        </div>
      </section>
    </main>
  );
}
