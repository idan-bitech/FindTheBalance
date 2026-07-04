"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  buttonPrimaryClassName,
  errorBoxClassName,
  inputClassName,
  labelClassName,
  textareaClassName,
} from "@/lib/ui-classes";
import { createGroup, type CreateGroupState } from "./actions";

const initialState: CreateGroupState = { error: null };

export function CreateGroupForm() {
  const [state, formAction, pending] = useActionState(createGroup, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className={labelClassName}>
          שם הקבוצה
        </label>
        <input id="name" name="name" type="text" required className={inputClassName} />
      </div>

      <div>
        <label htmlFor="description" className={labelClassName}>
          תיאור (אופציונלי)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className={textareaClassName}
        />
      </div>

      {state.error ? <p className={errorBoxClassName}>{state.error}</p> : null}

      <button type="submit" disabled={pending} className={buttonPrimaryClassName}>
        {pending ? "יוצר קבוצה..." : "יצירת קבוצה"}
      </button>

      <p className="text-center text-sm text-neutral-600">
        <Link href="/dashboard" className="font-semibold text-neutral-950 underline">
          חזרה למסך הראשי
        </Link>
      </p>
    </form>
  );
}
