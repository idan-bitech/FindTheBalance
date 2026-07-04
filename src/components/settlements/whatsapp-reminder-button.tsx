"use client";

import { useState } from "react";
import { formatILS } from "@/domain/money";
import { genderedText } from "@/lib/hebrew-copy";
import { errorBoxClassName, successBoxClassName } from "@/lib/ui-classes";
import type { PronounPreference } from "@/types/database";

type WhatsappReminderButtonProps = {
  friendName: string;
  creditorDisplayName: string;
  creditorPronounPreference: PronounPreference | null | undefined;
  amountCents: number;
};

const reminderButtonClassName =
  "inline-flex min-h-11 w-full items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 sm:w-auto";

export function WhatsappReminderButton({
  friendName,
  creditorDisplayName,
  creditorPronounPreference,
  amountCents,
}: WhatsappReminderButtonProps) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  async function handleClick() {
    setMessage(null);

    const inviteVerb = genderedText(creditorPronounPreference, {
      masculine: "מזמין",
      feminine: "מזמינה",
      neutral: "מזמין/ה",
    });
    const toPronoun = genderedText(creditorPronounPreference, {
      masculine: "לו",
      feminine: "לה",
      neutral: "לו/לה",
    });

    const reminderText = `היי ${friendName}, ${creditorDisplayName} ${inviteVerb} אותך לסגור את החשבון ולהעביר ${toPronoun} ${formatILS(
      amountCents
    )} כסף.\nנתראה בחיוב הבא ;)`;

    try {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(reminderText)}`;
      // Called synchronously within the click handler (no await before it),
      // so this is a trusted user gesture and won't be blocked on mobile Safari.
      const opened = window.open(whatsappUrl, "_blank", "noopener,noreferrer");

      if (opened) {
        setMessage({ type: "success", text: "התזכורת מוכנה לשליחה בוואטסאפ" });
        return;
      }

      await navigator.clipboard.writeText(reminderText);
      setMessage({ type: "success", text: "התזכורת הועתקה, אפשר להדביק בוואטסאפ" });
    } catch {
      setMessage({ type: "error", text: "לא הצלחנו להכין את התזכורת" });
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <button type="button" onClick={handleClick} className={reminderButtonClassName}>
        שליחת תזכורת בוואטסאפ
      </button>

      {message ? (
        <p className={message.type === "success" ? successBoxClassName : errorBoxClassName}>
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
