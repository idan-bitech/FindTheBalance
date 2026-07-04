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
  groupName: string;
  inviteLinks: GroupInviteLink[];
};

export function GroupInviteLinks({ groupId, groupName, inviteLinks }: GroupInviteLinksProps) {
  const router = useRouter();
  const origin = useWindowOrigin();
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  async function handleSendInvite() {
    if (pending) {
      return;
    }

    setPending(true);
    setMessage(null);

    // Open the tab synchronously, in direct response to the click, so mobile
    // Safari doesn't treat it as a blocked popup once we `await` below.
    let whatsappWindow: Window | null = null;
    try {
      whatsappWindow = window.open("", "_blank", "noopener,noreferrer");
    } catch {
      whatsappWindow = null;
    }

    try {
      let token = inviteLinks[0]?.token ?? createdToken;

      if (!token) {
        const result = await createGroupInviteLinkAction(
          groupId,
          { error: null, success: null, token: null },
          new FormData()
        );

        if (result.error || !result.token) {
          whatsappWindow?.close();
          setMessage({ type: "error", text: "לא הצלחנו להכין את ההזמנה" });
          return;
        }

        token = result.token;
        setCreatedToken(token);
        router.refresh();
      }

      const inviteUrl = origin ? `${origin}/join/${token}` : `/join/${token}`;
      const message = `הקבוצה ${groupName} הזמינה אותך לשחק חיובים:\n${inviteUrl}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

      if (whatsappWindow) {
        whatsappWindow.location.href = whatsappUrl;
        setMessage({ type: "success", text: "ההזמנה מוכנה לשליחה בוואטסאפ" });
        return;
      }

      await navigator.clipboard.writeText(message);
      setMessage({ type: "success", text: "ההזמנה הועתקה, אפשר להדביק בוואטסאפ" });
    } catch {
      whatsappWindow?.close();
      setMessage({ type: "error", text: "לא הצלחנו להכין את ההזמנה" });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-500">
        שלחו הזמנה לוואטסאפ כדי שחברים יוכלו להצטרף לקבוצה.
      </p>

      <button
        type="button"
        onClick={handleSendInvite}
        disabled={pending}
        className={buttonPrimaryClassName}
      >
        {pending ? "שולח..." : "שליחת הזמנה בוואטסאפ"}
      </button>

      {message ? (
        <p className={message.type === "success" ? successBoxClassName : errorBoxClassName}>
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
