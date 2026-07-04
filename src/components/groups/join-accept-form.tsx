"use client";

import { useActionState } from "react";
import { acceptInviteAction, type AcceptInviteState } from "@/server/invites";

const initialState: AcceptInviteState = { error: null };

type JoinAcceptFormProps = {
  token: string;
};

export function JoinAcceptForm({ token }: JoinAcceptFormProps) {
  const boundAction = acceptInviteAction.bind(null, token);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "מצטרף..." : "הצטרפות לקבוצה"}
      </button>
    </form>
  );
}
