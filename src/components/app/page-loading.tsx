import { AppShell } from "@/components/app/app-shell";
import { PublicPageShell } from "@/components/app/public-page-shell";
import { PageCard } from "@/components/app/page-card";

type PageLoadingProps = {
  message?: string;
  variant?: "app" | "public";
  backHref?: string;
  backLabel?: string;
};

export function PageLoading({
  message = "טוען...",
  variant = "app",
  backHref,
  backLabel,
}: PageLoadingProps) {
  const content = (
    <PageCard>
      <p className="text-center text-neutral-600" role="status" aria-live="polite">
        {message}
      </p>
    </PageCard>
  );

  if (variant === "public") {
    return <PublicPageShell>{content}</PublicPageShell>;
  }

  return (
    <AppShell backHref={backHref} backLabel={backLabel}>
      {content}
    </AppShell>
  );
}
