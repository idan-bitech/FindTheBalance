import { LoginForm } from "@/components/auth/login-form";
import { PageCard } from "@/components/app/page-card";
import { PublicPageShell } from "@/components/app/public-page-shell";
import { getSafeRedirectPath } from "@/lib/auth-redirect";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const redirectTo = getSafeRedirectPath(next);

  return (
    <PublicPageShell>
      <PageCard>
        <h1 className="mb-2 text-2xl font-bold text-neutral-950 sm:text-3xl">התחברות</h1>
        <p className="mb-6 text-neutral-600">התחברו כדי לנהל את הקבוצות שלכם</p>
        <LoginForm redirectTo={redirectTo} />
      </PageCard>
    </PublicPageShell>
  );
}
