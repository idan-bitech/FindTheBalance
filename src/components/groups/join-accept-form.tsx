"use client";

import { useActionState } from "react";
import { buttonPrimaryClassName, errorBoxClassName } from "@/lib/ui-classes";
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
      {state.error ? <p className={errorBoxClassName}>{state.error}</p> : null}

      <button type="submit" disabled={pending} className={buttonPrimaryClassName}>
        {pending ? "מצטרף..." : "הצטרפות לקבוצה"}
      </button>
    </form>
  );
}
