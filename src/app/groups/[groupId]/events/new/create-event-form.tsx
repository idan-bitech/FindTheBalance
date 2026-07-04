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
import { createEventAction, type CreateEventState } from "@/server/events";
import type { GroupMemberWithProfile } from "@/types/database";

const initialState: CreateEventState = { error: null };

type CreateEventFormProps = {
  groupId: string;
  members: GroupMemberWithProfile[];
  defaultDate: string;
};

export function CreateEventForm({ groupId, members, defaultDate }: CreateEventFormProps) {
  const boundAction = createEventAction.bind(null, groupId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="title" className={labelClassName}>
          כותרת
        </label>
        <input id="title" name="title" type="text" required className={inputClassName} />
      </div>

      <div>
        <label htmlFor="amount" className={labelClassName}>
          סכום (₪)
        </label>
        <input
          id="amount"
          name="amount"
          type="text"
          inputMode="decimal"
          required
          placeholder="0.00"
          className={inputClassName}
        />
      </div>

      <fieldset>
        <legend className={`${labelClassName} mb-2`}>משתתפים</legend>
        <div className="space-y-2 rounded-xl border border-stone-200 p-4">
          {members.map((member) => (
            <label
              key={member.user_id}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 py-1 hover:bg-stone-50"
            >
              <input
                type="checkbox"
                name="participantIds"
                value={member.user_id}
                defaultChecked
                className="h-4 w-4 rounded border-stone-300"
              />
              <span className="text-stone-950">
                {member.profiles?.display_name ?? "משתמש"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="eventDate" className={labelClassName}>
          תאריך
        </label>
        <input
          id="eventDate"
          name="eventDate"
          type="date"
          required
          defaultValue={defaultDate}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClassName}>
          תיאור (אופציונלי)
        </label>
        <textarea id="description" name="description" rows={3} className={textareaClassName} />
      </div>

      {state.error ? <p className={errorBoxClassName}>{state.error}</p> : null}

      <button type="submit" disabled={pending} className={buttonPrimaryClassName}>
        {pending ? "שומר..." : "שמירת הוצאה"}
      </button>

      <p className="text-center text-sm text-stone-600">
        <Link href={`/groups/${groupId}`} className="font-semibold text-stone-950 underline">
          חזרה לקבוצה
        </Link>
      </p>
    </form>
  );
}
