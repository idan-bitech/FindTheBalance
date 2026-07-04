import Link from "next/link";
import { PageCard } from "@/components/app/page-card";
import { PublicPageShell } from "@/components/app/public-page-shell";
import { JoinAcceptForm } from "@/components/groups/join-accept-form";
import { buttonPrimaryClassName, buttonSecondaryClassName } from "@/lib/ui-classes";
import { buildAuthHref } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";
import { getInvitePreview } from "@/server/invites";

type JoinPageProps = {
  params: Promise<{ token: string }>;
};

export default async function JoinPage({ params }: JoinPageProps) {
  const { token } = await params;
  const preview = await getInvitePreview(token);

  if (!preview) {
    return (
      <PublicPageShell homeHref="/" homeLabel="חזרה לדף הבית">
        <PageCard>
          <h1 className="mb-4 text-2xl font-bold text-stone-950">הזמנה לקבוצה</h1>
          <p className="text-stone-700">לינק ההזמנה לא תקין או שפג תוקפו</p>
        </PageCard>
      </PublicPageShell>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const joinPath = `/join/${token}`;
  const loginHref = buildAuthHref("/login", joinPath);
  const registerHref = buildAuthHref("/register", joinPath);

  return (
    <PublicPageShell homeHref="/" homeLabel="חזרה לדף הבית">
      <PageCard>
        <h1 className="mb-2 text-2xl font-bold text-stone-950 sm:text-3xl">
          הוזמנת להצטרף לקבוצה
        </h1>
        <p className="mb-6 text-lg text-stone-700">{preview.group_name}</p>

        {user ? (
          <JoinAcceptForm token={token} />
        ) : (
          <div className="flex flex-col gap-3">
            <Link href={loginHref} className={buttonPrimaryClassName}>
              התחברות כדי להצטרף
            </Link>
            <Link href={registerHref} className={buttonSecondaryClassName}>
              הרשמה כדי להצטרף
            </Link>
          </div>
        )}
      </PageCard>
    </PublicPageShell>
  );
}
