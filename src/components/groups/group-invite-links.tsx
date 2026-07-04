"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimaryClassName, errorBoxClassName, successBoxClassName } from "@/lib/ui-classes";
import { createGroupInviteLinkAction } from "@/server/invites";
import type { GroupInviteLink } from "@/types/database";

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

export function GroupInviteLinks({ groupId, inviteLinks }: GroupInviteLinksProps) {
  const router = useRouter();
  const origin = useWindowOrigin();
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  async function handleCopyInviteLink() {
    if (pending) {
      return;
    }

    setPending(true);
    setMessage(null);

    try {
      let token = inviteLinks[0]?.token ?? createdToken;

      if (!token) {
        const result = await createGroupInviteLinkAction(
          groupId,
          { error: null, success: null, token: null },
          new FormData()
        );

        if (result.error || !result.token) {
          setMessage({ type: "error", text: "לא הצלחנו להעתיק את לינק ההזמנה" });
          return;
        }

        token = result.token;
        setCreatedToken(token);
        router.refresh();
      }

      const inviteUrl = origin ? `${origin}/join/${token}` : `/join/${token}`;
      await navigator.clipboard.writeText(inviteUrl);
      setMessage({ type: "success", text: "לינק ההזמנה הועתק" });
    } catch {
      setMessage({ type: "error", text: "לא הצלחנו להעתיק את לינק ההזמנה" });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-500">
        צרו לינק ושלחו אותו לחברים כדי שיוכלו להצטרף לקבוצה.
      </p>

      <button
        type="button"
        onClick={handleCopyInviteLink}
        disabled={pending}
        className={buttonPrimaryClassName}
      >
        {pending ? "מעתיק..." : "העתקת לינק הזמנה"}
      </button>

      {message ? (
        <p className={message.type === "success" ? successBoxClassName : errorBoxClassName}>
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
