"use client";

import { useActionState, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { formatEntryDate } from "@/lib/balance-display";
import {
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  errorBoxClassName,
  successBoxClassName,
} from "@/lib/ui-classes";
import {
  createGroupInviteLinkAction,
  revokeGroupInviteLinkAction,
  type InviteActionState,
} from "@/server/invites";
import type { GroupInviteLink } from "@/types/database";

const initialState: InviteActionState = { error: null, success: null };

function useWindowOrigin() {
  return useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
}

type GroupInviteLinksProps = {
  groupId: string;
  inviteLinks: GroupInviteLink[];
};

function InviteLinkCard({
  groupId,
  link,
}: {
  groupId: string;
  link: GroupInviteLink;
}) {
  const router = useRouter();
  const origin = useWindowOrigin();
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const inviteUrl = origin ? `${origin}/join/${link.token}` : `/join/${link.token}`;
  const revokeAction = revokeGroupInviteLinkAction.bind(null, groupId, link.id);
  const [revokeState, revokeFormAction, revokePending] = useActionState(
    revokeAction,
    initialState
  );

  useEffect(() => {
    if (revokeState.success) {
      router.refresh();
    }
  }, [revokeState.success, router]);

  async function handleCopy() {
    setCopyMessage(null);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
        setCopyMessage("הלינק הועתק");
        return;
      }
    } catch {
      // fall through to fallback
    }

    setCopyMessage(`לא הצלחנו להעתיק אוטומטית. העתיקו ידנית: ${inviteUrl}`);
  }

  return (
    <li className="rounded-2xl border border-neutral-200 p-5">
      <div className="mb-3 break-all rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-800">
        {inviteUrl}
      </div>

      <dl className="mb-4 space-y-2 text-sm text-neutral-600">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt>תוקף עד</dt>
          <dd className="font-medium text-neutral-900">{formatEntryDate(link.expires_at)}</dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt>שימושים</dt>
          <dd className="font-medium text-neutral-900">{link.uses_count}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={handleCopy} className={buttonSecondaryClassName}>
          העתקת לינק
        </button>

        <form action={revokeFormAction}>
          <button
            type="submit"
            disabled={revokePending}
            className="w-full rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60 sm:w-auto"
          >
            {revokePending ? "מבטל..." : "ביטול לינק"}
          </button>
        </form>
      </div>

      {copyMessage ? (
        <p className="mt-3 text-sm text-neutral-600">{copyMessage}</p>
      ) : null}

      {revokeState.error ? <p className={`mt-3 ${errorBoxClassName}`}>{revokeState.error}</p> : null}

      {revokeState.success ? (
        <p className={`mt-3 ${successBoxClassName}`}>{revokeState.success}</p>
      ) : null}
    </li>
  );
}

export function GroupInviteLinks({ groupId, inviteLinks }: GroupInviteLinksProps) {
  const router = useRouter();
  const createAction = createGroupInviteLinkAction.bind(null, groupId);
  const [createState, createFormAction, createPending] = useActionState(
    createAction,
    initialState
  );

  useEffect(() => {
    if (createState.success) {
      router.refresh();
    }
  }, [createState.success, router]);

  const showEmptyState = inviteLinks.length === 0 && !createState.success;

  return (
    <div className="space-y-4">
      <form action={createFormAction}>
        <button type="submit" disabled={createPending} className={buttonPrimaryClassName}>
          {createPending ? "יוצר לינק..." : "יצירת לינק הזמנה"}
        </button>
      </form>

      {createState.error ? <p className={errorBoxClassName}>{createState.error}</p> : null}

      {createState.success ? <p className={successBoxClassName}>{createState.success}</p> : null}

      {showEmptyState ? (
        <p className="text-neutral-600">עדיין לא נוצר לינק הזמנה לקבוצה</p>
      ) : inviteLinks.length > 0 ? (
        <ul className="space-y-3">
          {inviteLinks.map((link) => (
            <InviteLinkCard key={link.id} groupId={groupId} link={link} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
