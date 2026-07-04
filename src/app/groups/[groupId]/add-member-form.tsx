"use client";

import { useActionState } from "react";
import {
  buttonPrimaryClassName,
  errorBoxClassName,
  inputClassName,
  labelClassName,
  successBoxClassName,
} from "@/lib/ui-classes";
import { addMemberByEmail, type AddMemberState } from "@/server/groups";

const initialState: AddMemberState = { error: null, success: null };

type AddMemberFormProps = {
  groupId: string;
};

export function AddMemberForm({ groupId }: AddMemberFormProps) {
  const boundAction = addMemberByEmail.bind(null, groupId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <label htmlFor="email" className={labelClassName}>
        הוספת חבר לפי אימייל
      </label>
      <p className="mb-2 text-sm text-neutral-500">
        המשתמש צריך להיות רשום במערכת כדי להוסיף אותו ישירות.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="friend@example.com"
          className={inputClassName}
        />
        <button type="submit" disabled={pending} className={buttonPrimaryClassName}>
          {pending ? "מוסיף..." : "הוספה"}
        </button>
      </div>

      {state.error ? <p className={errorBoxClassName}>{state.error}</p> : null}
      {state.success ? <p className={successBoxClassName}>{state.success}</p> : null}
    </form>
  );
}
