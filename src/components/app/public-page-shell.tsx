import Link from "next/link";
import { linkMutedClassName } from "@/lib/ui-classes";

type PublicPageShellProps = {
  children: React.ReactNode;
  homeHref?: string;
  homeLabel?: string;
};

export function PublicPageShell({
  children,
  homeHref = "/",
  homeLabel = "חזרה לדף הבית",
}: PublicPageShellProps) {
  return (
    <div className="min-h-screen bg-neutral-50 text-right">
      <header className="border-b border-neutral-200 bg-white pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3 sm:max-w-2xl sm:px-6">
          <Link
            href="/"
            className="text-base font-semibold text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 rounded"
          >
            Friends Balance
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:max-w-2xl sm:px-6 sm:py-10 sm:pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
        {homeHref ? (
          <Link href={homeHref} className={`${linkMutedClassName} mb-6 inline-block`}>
            {homeLabel}
          </Link>
        ) : null}
        {children}
      </main>
    </div>
  );
}
