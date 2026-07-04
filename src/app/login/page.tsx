import { LoginForm } from "@/components/auth/login-form";
import { PageCard } from "@/components/app/page-card";
import { PublicPageShell } from "@/components/app/public-page-shell";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { errorBoxClassName } from "@/lib/ui-classes";

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

function getCallbackErrorMessage(error?: string): string | null {
  if (!error) {
    return null;
  }

  return "אימות המייל נכשל או שהקישור פג תוקף. נסו להתחבר או להירשם מחדש.";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error } = await searchParams;
  const redirectTo = getSafeRedirectPath(next);
  const callbackError = getCallbackErrorMessage(error);

  return (
    <PublicPageShell>
      <PageCard>
        <h1 className="mb-2 text-2xl font-bold text-stone-950 sm:text-3xl">התחברות</h1>
        <p className="mb-6 text-stone-600">התחברו כדי להמשיך לקבוצות ולהתחשבנויות שלכם</p>
        {callbackError ? <p className={`mb-4 ${errorBoxClassName}`}>{callbackError}</p> : null}
        <LoginForm redirectTo={redirectTo} />
      </PageCard>
    </PublicPageShell>
  );
}
