"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createGroup, type CreateGroupState } from "./actions";

const initialState: CreateGroupState = { error: null };

export function CreateGroupForm() {
  const [state, formAction, pending] = useActionState(createGroup, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-neutral-700">
          שם הקבוצה
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-950 outline-none focus:border-neutral-950"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-neutral-700"
        >
          תיאור (אופציונלי)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-950 outline-none focus:border-neutral-950"
        />
      </div>

      {state.error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "יוצר קבוצה..." : "יצירת קבוצה"}
      </button>

      <p className="text-center text-sm text-neutral-600">
        <Link href="/dashboard" className="font-semibold text-neutral-950 underline">
          חזרה ללוח הבקרה
        </Link>
      </p>
    </form>
  );
}
