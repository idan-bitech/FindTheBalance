import { RegisterForm } from "@/components/auth/register-form";
import { PageCard } from "@/components/app/page-card";
import { PublicPageShell } from "@/components/app/public-page-shell";
import { getSafeRedirectPath } from "@/lib/auth-redirect";

type RegisterPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { next } = await searchParams;
  const redirectTo = getSafeRedirectPath(next);

  return (
    <PublicPageShell>
      <PageCard>
        <h1 className="mb-2 text-2xl font-bold text-stone-950 sm:text-3xl">יוצרים חשבון ומתחילים</h1>
        <p className="mb-6 text-stone-600">כמה פרטים קטנים, ואפשר להצטרף לקבוצות ולנהל הוצאות יחד</p>
        <RegisterForm redirectTo={redirectTo} />
      </PageCard>
    </PublicPageShell>
  );
}
