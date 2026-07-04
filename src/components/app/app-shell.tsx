import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { linkMutedClassName } from "@/lib/ui-classes";

type AppShellProps = {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  showLogout?: boolean;
  maxWidth?: "md" | "2xl";
};

const maxWidthClasses = {
  md: "max-w-md",
  "2xl": "max-w-2xl",
} as const;

export function AppShell({
  children,
  backHref,
  backLabel,
  showLogout = true,
  maxWidth = "2xl",
}: AppShellProps) {
  const widthClass = maxWidthClasses[maxWidth];

  return (
    <div className="min-h-screen bg-stone-50 text-right">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className={`mx-auto flex w-full ${widthClass} flex-col gap-2 px-4 py-3 sm:px-6`}>
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/dashboard"
              className="truncate text-base font-semibold text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 rounded"
            >
              Keep the Balance
            </Link>
            {showLogout ? <LogoutButton /> : null}
          </div>
          {backHref ? (
            <Link href={backHref} className={linkMutedClassName}>
              {backLabel ?? "חזרה"}
            </Link>
          ) : null}
        </div>
      </header>

      <main
        className={`mx-auto w-full ${widthClass} px-4 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-8 sm:pb-[calc(2rem+env(safe-area-inset-bottom))]`}
      >
        {children}
      </main>
    </div>
  );
}
