import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-right">
      <section className="mx-auto w-full max-w-md">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-neutral-200">
          <Link
            href="/"
            className="mb-6 inline-block text-sm font-medium text-neutral-500 hover:text-neutral-800"
          >
            חזרה לדף הבית
          </Link>

          <h1 className="mb-2 text-3xl font-bold text-neutral-950">הרשמה</h1>
          <p className="mb-8 text-neutral-600">צרו חשבון חדש כדי להתחיל</p>

          <RegisterForm />
        </div>
      </section>
    </main>
  );
}
