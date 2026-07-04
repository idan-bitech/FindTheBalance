"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildAuthHref } from "@/lib/auth-redirect";
import {
  buttonPrimaryClassName,
  errorBoxClassName,
  infoBoxClassName,
  inputClassName,
  labelClassName,
} from "@/lib/ui-classes";
import { createClient } from "@/lib/supabase/client";

function getHebrewRegisterError(error: { message: string; code?: string }): string {
  const lower = error.message.toLowerCase();
  const code = error.code?.toLowerCase() ?? "";

  if (
    code === "user_already_exists" ||
    lower.includes("already registered") ||
    lower.includes("already been registered") ||
    lower.includes("user already exists")
  ) {
    return "כבר קיים חשבון עם האימייל הזה. התחברו כדי להצטרף לקבוצה.";
  }

  if (lower.includes("weak") || lower.includes("password")) {
    return "הסיסמה חלשה מדי. בחרו סיסמה ארוכה וחזקה יותר.";
  }

  if (lower.includes("valid email") || lower.includes("invalid email")) {
    return "כתובת האימייל לא תקינה.";
  }

  return "ההרשמה נכשלה. נסו שוב";
}

type RegisterFormProps = {
  redirectTo: string;
};

export function RegisterForm({ redirectTo }: RegisterFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) {
      return;
    }
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
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
      console.error("signUp failed", signUpError);
      setError(getHebrewRegisterError(signUpError));
      return;
    }

    if (!data.session) {
      setInfoMessage(
        "נשלח אליכם מייל לאימות החשבון. לאחר האימות תוכלו להצטרף לקבוצה."
      );
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="displayName" className={labelClassName}>
          שם תצוגה
        </label>
        <input
          id="displayName"
          type="text"
          required
          autoComplete="name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className={inputClassName}
        />
      </div>

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
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClassName}
        />
      </div>

      {error ? <p className={errorBoxClassName}>{error}</p> : null}

      {infoMessage ? (
        <div className={infoBoxClassName}>
          <p>{infoMessage}</p>
          <p className="mt-2">
            <Link
              href={buildAuthHref("/login", redirectTo)}
              className="font-semibold text-blue-950 underline"
            >
              התחברות
            </Link>
          </p>
        </div>
      ) : null}

      <button type="submit" disabled={loading} className={buttonPrimaryClassName}>
        {loading ? "נרשם..." : "הרשמה"}
      </button>

      <p className="text-center text-sm text-neutral-600">
        כבר יש לכם חשבון?{" "}
        <Link
          href={buildAuthHref("/login", redirectTo)}
          className="font-semibold text-neutral-950 underline"
        >
          התחברות
        </Link>
      </p>
    </form>
  );
}
