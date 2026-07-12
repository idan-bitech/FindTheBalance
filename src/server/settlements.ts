"use server";

import { redirect } from "next/navigation";
import { getPairNetBalance } from "@/domain/debt";
import { shekelToAgorot } from "@/domain/money";
import { createClient } from "@/lib/supabase/server";
import { getGroupWithMembers } from "@/server/groups";
import type { LedgerEntry, Profile } from "@/types/database";

export type PairLedgerEntry = LedgerEntry & { eventTitle?: string | null };

export type PairBalanceResult = {
  netAmountCents: number;
  friend: Profile;
  currency: string;
};

export type PairPageData = PairBalanceResult & {
  entries: PairLedgerEntry[];
};

async function validatePairAccess(groupId: string, friendUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  if (friendUserId === user.id) {
    return null;
  }

  const groupData = await getGroupWithMembers(groupId);
  if (!groupData) {
    return null;
  }

  const activeMemberIds = new Set(groupData.members.map((member) => member.user_id));
  if (!activeMemberIds.has(user.id) || !activeMemberIds.has(friendUserId)) {
    return null;
  }

  const { data: friend, error: friendError } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .eq("id", friendUserId)
    .maybeSingle();

  if (friendError || !friend) {
    return null;
  }

  return {
    supabase,
    user,
    group: groupData.group,
    friend: friend as Profile,
  };
}

type PairAccessContext = NonNullable<Awaited<ReturnType<typeof validatePairAccess>>>;

/**
 * Fetches ledger entries for a pair and, for entries sourced from an event,
 * batches a single follow-up query to attach the event title (avoiding an
 * N+1 query per entry).
 */
async function fetchPairLedgerEntries(
  context: PairAccessContext,
  groupId: string,
  friendUserId: string
): Promise<PairLedgerEntry[]> {
  const { supabase, user } = context;

  const { data: entries, error } = await supabase
    .from("ledger_entries")
    .select(
      "id, group_id, source_type, source_id, from_user_id, to_user_id, amount_cents, currency, created_at"
    )
    .eq("group_id", groupId)
    .eq("is_void", false)
    .or(
      `and(from_user_id.eq.${user.id},to_user_id.eq.${friendUserId}),and(from_user_id.eq.${friendUserId},to_user_id.eq.${user.id})`
    )
    .order("created_at", { ascending: false });

  if (error || !entries) {
    return [];
  }

  const eventSourceIds = Array.from(
    new Set(
      entries
        .filter((entry) => entry.source_type === "event")
        .map((entry) => entry.source_id as string)
    )
  );

  let eventTitleById = new Map<string, string>();

  if (eventSourceIds.length > 0) {
    const { data: eventRows } = await supabase
      .from("events")
      .select("id, title")
      .in("id", eventSourceIds);

    if (eventRows) {
      eventTitleById = new Map(eventRows.map((row) => [row.id as string, row.title as string]));
    }
  }

  return entries.map((entry) => ({
    ...entry,
    eventTitle:
      entry.source_type === "event" ? (eventTitleById.get(entry.source_id) ?? null) : null,
  })) as PairLedgerEntry[];
}

export async function getPairLedgerEntries(
  groupId: string,
  friendUserId: string
): Promise<PairLedgerEntry[]> {
  const context = await validatePairAccess(groupId, friendUserId);
  if (!context) {
    return [];
  }

  return fetchPairLedgerEntries(context, groupId, friendUserId);
}

/**
 * Single consolidated fetch for the pair detail page: validates access once
 * and fetches the ledger entries once, deriving both the net balance and the
 * entries list from that one round-trip instead of the page separately
 * calling balance + entries (which used to validate access and re-fetch the
 * ledger twice).
 */
export async function getPairPageData(
  groupId: string,
  friendUserId: string
): Promise<PairPageData | null> {
  const context = await validatePairAccess(groupId, friendUserId);
  if (!context) {
    return null;
  }

  const entries = await fetchPairLedgerEntries(context, groupId, friendUserId);

  return {
    netAmountCents: getPairNetBalance({
      entries,
      userAId: context.user.id,
      userBId: friendUserId,
    }),
    friend: context.friend,
    currency: context.group.currency || "ILS",
    entries,
  };
}

export type CreateSettlementState = {
  error: string | null;
};

export async function createSettlementAction(
  groupId: string,
  friendUserId: string,
  _prevState: CreateSettlementState,
  formData: FormData
): Promise<CreateSettlementState> {
  const context = await validatePairAccess(groupId, friendUserId);
  if (!context) {
    return { error: "אין גישה לקבוצה" };
  }

  const { supabase, user, group } = context;

  const entries = await fetchPairLedgerEntries(context, groupId, friendUserId);
  const netAmountCents = getPairNetBalance({
    entries,
    userAId: user.id,
    userBId: friendUserId,
  });

  if (netAmountCents === 0) {
    return { error: "אין יתרה לסגירה" };
  }

  const amountRaw = String(formData.get("amount") ?? "").trim();
  const noteRaw = String(formData.get("note") ?? "").trim();
  const settlementAmountCents = shekelToAgorot(amountRaw);

  if (settlementAmountCents <= 0) {
    return { error: "יש להזין סכום תקין" };
  }

  const outstandingCents = Math.abs(netAmountCents);
  if (settlementAmountCents > outstandingCents) {
    return { error: "הסכום גדול מהחוב הקיים" };
  }

  const paidByUserId = netAmountCents > 0 ? friendUserId : user.id;
  const paidToUserId = netAmountCents > 0 ? user.id : friendUserId;
  const currency = group.currency || "ILS";
  const settledAt = new Date().toISOString();

  const { data: settlement, error: settlementError } = await supabase
    .from("settlements")
    .insert({
      group_id: groupId,
      paid_by_user_id: paidByUserId,
      paid_to_user_id: paidToUserId,
      amount_cents: settlementAmountCents,
      currency,
      note: noteRaw || null,
      created_by: user.id,
      settled_at: settledAt,
    })
    .select("id")
    .single();

  if (settlementError || !settlement) {
    return { error: "לא הצלחנו לסגור את החוב. נסו שוב." };
  }

  const { error: ledgerError } = await supabase.from("ledger_entries").insert({
    group_id: groupId,
    source_type: "settlement",
    source_id: settlement.id,
    from_user_id: paidToUserId,
    to_user_id: paidByUserId,
    amount_cents: settlementAmountCents,
    currency,
  });

  if (ledgerError) {
    return { error: "לא הצלחנו לסגור את החוב. נסו שוב." };
  }

  redirect(`/groups/${groupId}/friends/${friendUserId}`);
}
