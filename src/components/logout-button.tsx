"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100"
    >
      התנתקות
    </button>
  );
}
