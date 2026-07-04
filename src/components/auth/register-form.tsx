"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function getHebrewAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("user already registered")) {
    return "כתובת האימייל כבר רשומה במערכת";
  }
  if (lower.includes("password")) {
    return "הסיסמה חייבת להיות באורך של לפחות 6 תווים";
  }
  if (lower.includes("valid email")) {
    return "יש להזין כתובת אימייל תקינה";
  }

  return "ההרשמה נכשלה. נסו שוב";
}

export function RegisterForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(getHebrewAuthError(signUpError.message));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-neutral-700">
          שם תצוגה
        </label>
        <input
          id="displayName"
          type="text"
          required
          autoComplete="name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-950 outline-none focus:border-neutral-950"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-neutral-700">
          אימייל
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-950 outline-none focus:border-neutral-950"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-neutral-700">
          סיסמה
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-950 outline-none focus:border-neutral-950"
        />
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
      >
        {loading ? "נרשם..." : "הרשמה"}
      </button>

      <p className="text-center text-sm text-neutral-600">
        כבר יש לכם חשבון?{" "}
        <Link href="/login" className="font-semibold text-neutral-950 underline">
          התחברות
        </Link>
      </p>
    </form>
  );
}
