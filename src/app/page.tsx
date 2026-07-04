import Link from "next/link";
import { buttonPrimaryClassName, buttonSecondaryClassName } from "@/lib/ui-classes";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 pt-[calc(2rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] text-right sm:px-6 sm:py-10">
      <section className="mx-auto flex min-h-[80vh] w-full max-w-3xl flex-col justify-center">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 sm:rounded-3xl sm:p-8">
          <p className="mb-3 text-sm font-medium text-neutral-500">Friends Balance</p>

          <h1 className="mb-4 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            ניהול חובות פשוט בין חברים
          </h1>

          <p className="mb-8 text-base leading-8 text-neutral-600 sm:text-lg">
            פותחים קבוצה, מוסיפים הוצאות, ורואים תמיד מי חייב למי — בלי
            אקסלים ובלי בלגן.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className={buttonPrimaryClassName}>
              התחברות
            </Link>

            <Link href="/register" className={buttonSecondaryClassName}>
              הרשמה
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
