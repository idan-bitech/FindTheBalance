"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildAuthHref } from "@/lib/auth-redirect";
import {
  buttonPrimaryClassName,
  errorBoxClassName,
  inputClassName,
  labelClassName,
} from "@/lib/ui-classes";
import { createClient } from "@/lib/supabase/client";

function getHebrewAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "אימייל או סיסמה שגויים";
  }
  if (lower.includes("email not confirmed")) {
    return "יש לאשר את כתובת האימייל לפני ההתחברות";
  }

  return "לא הצלחנו לחבר אתכם. נסו שוב.";
}

type LoginFormProps = {
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) {
      return;
    }
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(getHebrewAuthError(signInError.message));
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className={labelClassName}>
          אימייל
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="password" className={labelClassName}>
          סיסמה
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClassName}
        />
      </div>

      {error ? <p className={errorBoxClassName}>{error}</p> : null}

      <button type="submit" disabled={loading} className={buttonPrimaryClassName}>
        {loading ? "מתחבר..." : "התחברות"}
      </button>

      <p className="text-center text-sm text-stone-600">
        אין לכם חשבון?{" "}
        <Link
          href={buildAuthHref("/register", redirectTo)}
          className="font-semibold text-stone-950 underline"
        >
          הרשמה
        </Link>
      </p>
    </form>
  );
}
