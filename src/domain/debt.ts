export type LedgerEntryInsert = {
  group_id: string;
  source_type: string;
  source_id: string;
  from_user_id: string;
  to_user_id: string;
  amount_cents: number;
  currency: string;
};

export type LedgerEntryRow = {
  from_user_id: string;
  to_user_id: string;
  amount_cents: number;
};

/**
 * Split total equally among participants.
 * Remainder agorot are distributed one-by-one to the first participants.
 */
export function splitEqually(
  totalAmountCents: number,
  participantIds: string[]
): Map<string, number> {
  const shares = new Map<string, number>();

  if (participantIds.length === 0 || totalAmountCents <= 0) {
    return shares;
  }

  const baseShare = Math.floor(totalAmountCents / participantIds.length);
  const remainder = totalAmountCents % participantIds.length;

  participantIds.forEach((participantId, index) => {
    shares.set(participantId, baseShare + (index < remainder ? 1 : 0));
  });

  return shares;
}

export function createEventLedgerEntries({
  groupId,
  eventId,
  paidByUserId,
  shares,
  currency,
}: {
  groupId: string;
  eventId: string;
  paidByUserId: string;
  shares: Map<string, number>;
  currency: string;
}): LedgerEntryInsert[] {
  const entries: LedgerEntryInsert[] = [];

  for (const [userId, amountCents] of shares) {
    if (userId === paidByUserId || amountCents <= 0) {
      continue;
    }

    entries.push({
      group_id: groupId,
      source_type: "event",
      source_id: eventId,
      from_user_id: userId,
      to_user_id: paidByUserId,
      amount_cents: amountCents,
      currency,
    });
  }

  return entries;
}

/**
 * Net balance between two users from ledger entries.
 * Positive: userB owes userA. Negative: userA owes userB.
 */
export function getPairNetBalance({
  entries,
  userAId,
  userBId,
}: {
  entries: LedgerEntryRow[];
  userAId: string;
  userBId: string;
}): number {
  let net = 0;

  for (const entry of entries) {
    if (entry.from_user_id === userBId && entry.to_user_id === userAId) {
      net += entry.amount_cents;
    }
    if (entry.from_user_id === userAId && entry.to_user_id === userBId) {
      net -= entry.amount_cents;
    }
  }

  return net;
}
