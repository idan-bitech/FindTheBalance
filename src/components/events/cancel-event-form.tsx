"use client";

import { useActionState } from "react";
import { cancelEventAction, type CancelEventState } from "@/server/events";

const initialState: CancelEventState = { error: null };

type CancelEventFormProps = {
  groupId: string;
  eventId: string;
};

export function CancelEventForm({ groupId, eventId }: CancelEventFormProps) {
  const boundAction = cancelEventAction.bind(null, groupId, eventId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
      <p className="mb-4 text-sm text-amber-900">
        ביטול ההוצאה יסיר את ההשפעה שלה מהיתרות, אבל ישאיר אותה בהיסטוריה.
      </p>

      <form action={formAction}>
        {state.error ? (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-amber-700 bg-white px-6 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 disabled:opacity-60"
        >
          {pending ? "מבטל..." : "ביטול הוצאה"}
        </button>
      </form>
    </div>
  );
}
