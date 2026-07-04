import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-right">
      <section className="mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center">
        <div className="w-full rounded-3xl bg-white p-8 shadow-sm ring-1 ring-neutral-200">
          <p className="mb-3 text-sm font-medium text-neutral-500">
            Friends Balance
          </p>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-neutral-950">
            ניהול חובות פשוט בין חברים
          </h1>

          <p className="mb-8 text-lg leading-8 text-neutral-600">
            אפליקציה פשוטה לניהול התחשבנויות בקבוצות חברים — מי שילם, מי
            השתתף, מי חייב למי, ומתי החוב נסגר.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-full bg-neutral-950 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              התחברות
            </Link>

            <Link
              href="/register"
              className="rounded-full border border-neutral-300 bg-white px-6 py-3 text-center text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100"
            >
              הרשמה
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}