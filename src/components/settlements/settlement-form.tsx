"use client";

import { useActionState } from "react";
import { PageCard } from "@/components/app/page-card";
import { WhatsappReminderButton } from "@/components/settlements/whatsapp-reminder-button";
import { formatPairSummaryMain, formatShekelInput } from "@/lib/balance-display";
import {
  buttonPrimaryClassName,
  errorBoxClassName,
  inputClassName,
  labelClassName,
  textareaClassName,
} from "@/lib/ui-classes";
import { createSettlementAction, type CreateSettlementState } from "@/server/settlements";
import type { PronounPreference } from "@/types/database";

const initialState: CreateSettlementState = { error: null };

type SettlementFormProps = {
  groupId: string;
  friendUserId: string;
  friendName: string;
  netAmountCents: number;
  creditorDisplayName: string;
  creditorPronounPreference: PronounPreference | null | undefined;
};

export function SettlementForm({
  groupId,
  friendUserId,
  friendName,
  netAmountCents,
  creditorDisplayName,
  creditorPronounPreference,
}: SettlementFormProps) {
  const boundAction = createSettlementAction.bind(null, groupId, friendUserId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  const submitLabel = netAmountCents > 0 ? "סמן שקיבלתי תשלום" : "סמן ששילמתי";

  return (
    <PageCard>
      <h2 className="mb-2 text-lg font-bold text-stone-950 sm:text-xl">סגירת חוב</h2>
      <p className="mb-6 text-stone-700">{formatPairSummaryMain(netAmountCents)}</p>

      <form action={formAction} className="space-y-4">
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
            defaultValue={formatShekelInput(netAmountCents)}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="note" className={labelClassName}>
            הערה (אופציונלי)
          </label>
          <textarea id="note" name="note" rows={2} className={textareaClassName} />
        </div>

        {state.error ? <p className={errorBoxClassName}>{state.error}</p> : null}

        <button type="submit" disabled={pending} className={buttonPrimaryClassName}>
          {pending ? "שומר..." : submitLabel}
        </button>
      </form>

      {netAmountCents > 0 ? (
        <WhatsappReminderButton
          friendName={friendName}
          creditorDisplayName={creditorDisplayName}
          creditorPronounPreference={creditorPronounPreference}
          amountCents={netAmountCents}
        />
      ) : null}
    </PageCard>
  );
}
