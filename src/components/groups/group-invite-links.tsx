"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  errorBoxClassName,
  successBoxClassName,
} from "@/lib/ui-classes";
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

type StatusMessage = { type: "success" | "error"; text: string };

export function GroupInviteLinks({ groupId, groupName, inviteLinks }: GroupInviteLinksProps) {
  const router = useRouter();
  const origin = useWindowOrigin();
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [whatsappPending, setWhatsappPending] = useState(false);
  const [copyPending, setCopyPending] = useState(false);
  const [message, setMessage] = useState<StatusMessage | null>(null);

  const token = inviteLinks[0]?.token ?? createdToken;
  const inviteUrl = token ? (origin ? `${origin}/join/${token}` : `/join/${token}`) : null;
  const whatsappUrl = inviteUrl
    ? `https://wa.me/?text=${encodeURIComponent(
        `הקבוצה ${groupName} הזמינה אותך לשחק חיובים:\n${inviteUrl}`
      )}`
    : null;

  async function ensureInviteToken(): Promise<string | null> {
    if (token) {
      return token;
    }

    const result = await createGroupInviteLinkAction(
      groupId,
      { error: null, success: null, token: null },
      new FormData()
    );

    if (result.error || !result.token) {
      return null;
    }

    setCreatedToken(result.token);
    router.refresh();
    return result.token;
  }

  async function handlePrepareWhatsapp() {
    if (whatsappPending || whatsappUrl) {
      return;
    }

    setWhatsappPending(true);
    setMessage(null);

    try {
      const readyToken = await ensureInviteToken();
      if (!readyToken) {
        setMessage({ type: "error", text: "לא הצלחנו להכין את ההזמנה" });
        return;
      }

      setMessage({ type: "success", text: "ההזמנה מוכנה לשליחה בוואטסאפ" });
    } catch {
      setMessage({ type: "error", text: "לא הצלחנו להכין את ההזמנה" });
    } finally {
      setWhatsappPending(false);
    }
  }

  async function handleCopyLink() {
    if (copyPending) {
      return;
    }

    setCopyPending(true);
    setMessage(null);

    try {
      const readyToken = await ensureInviteToken();
      if (!readyToken) {
        setMessage({ type: "error", text: "לא הצלחנו להעתיק את הלינק" });
        return;
      }

      const url = origin ? `${origin}/join/${readyToken}` : `/join/${readyToken}`;
      await navigator.clipboard.writeText(url);
      setMessage({ type: "success", text: "לינק ההזמנה הועתק" });
    } catch {
      setMessage({ type: "error", text: "לא הצלחנו להעתיק את הלינק" });
    } finally {
      setCopyPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-500">
        שלחו הזמנה בוואטסאפ או העתיקו לינק כדי שחברים יוכלו להצטרף לקבוצה.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonPrimaryClassName}
            onClick={() =>
              setMessage({ type: "success", text: "ההזמנה מוכנה לשליחה בוואטסאפ" })
            }
          >
            שליחה בוואטסאפ
          </a>
        ) : (
          <button
            type="button"
            onClick={handlePrepareWhatsapp}
            disabled={whatsappPending}
            className={buttonPrimaryClassName}
          >
            {whatsappPending ? "מכין..." : "שליחה בוואטסאפ"}
          </button>
        )}

        <button
          type="button"
          onClick={handleCopyLink}
          disabled={copyPending}
          className={buttonSecondaryClassName}
        >
          {copyPending ? "מעתיק..." : "העתקת לינק"}
        </button>
      </div>

      {message ? (
        <p className={message.type === "success" ? successBoxClassName : errorBoxClassName}>
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
