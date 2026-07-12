"use server";

import { redirect } from "next/navigation";
import { createEventLedgerEntries, splitEqually } from "@/domain/debt";
import { shekelToAgorot } from "@/domain/money";
import { normalizeProfile } from "@/lib/profile-utils";
import { createClient } from "@/lib/supabase/server";
import { getGroupWithMembers } from "@/server/groups";
import type {
  EventDetail,
  EventParticipantWithProfile,
  EventWithPayer,
  LedgerEntry,
  Profile,
} from "@/types/database";

type EventRow = {
  id: string;
  group_id: string;
  title: string;
  description: string | null;
  total_amount_cents: number;
  paid_by_user_id: string;
  event_date: string;
  currency: string;
  split_type: string;
  status: string;
  created_by: string;
  created_at: string;
  profiles: Profile | Profile[] | null;
  event_participants: { user_id: string }[] | { user_id: string } | null;
};

type ParticipantRow = {
  user_id: string;
  share_amount_cents: number;
  profiles: Profile | Profile[] | null;
};

export type CreateEventState = {
  error: string | null;
};

export type CancelEventState = {
  error: string | null;
};

export async function createEventAction(
  groupId: string,
  _prevState: CreateEventState,
  formData: FormData
): Promise<CreateEventState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const groupData = await getGroupWithMembers(groupId);
  if (!groupData) {
    return { error: "אין גישה לקבוצה" };
  }

  const paidByUserId = user.id;
  const activeMemberIds = new Set(groupData.members.map((member) => member.user_id));

  if (!activeMemberIds.has(paidByUserId)) {
    return { error: "אין גישה לקבוצה" };
  }

  const title = String(formData.get("title") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const participantIds = formData
    .getAll("participantIds")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!title) {
    return { error: "יש להזין כותרת להוצאה" };
  }

  const totalAmountCents = shekelToAgorot(amountRaw);
  if (totalAmountCents <= 0) {
    return { error: "יש להזין סכום תקין" };
  }

  if (participantIds.length === 0) {
    return { error: "יש לבחור לפחות משתתף אחד" };
  }

  const invalidParticipant = participantIds.some((id) => !activeMemberIds.has(id));
  if (invalidParticipant) {
    return { error: "כל המשתתפים חייבים להיות חברים פעילים בקבוצה" };
  }

  if (!eventDate || Number.isNaN(Date.parse(eventDate))) {
    return { error: "יש לבחור תאריך תקין" };
  }

  const currency = groupData.group.currency || "ILS";

  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      group_id: groupId,
      title,
      description: descriptionRaw || null,
      total_amount_cents: totalAmountCents,
      paid_by_user_id: paidByUserId,
      created_by: user.id,
      event_date: eventDate,
      currency,
      split_type: "equal",
      status: "active",
    })
    .select("id")
    .single();

  if (eventError || !event) {
    return { error: "לא הצלחנו לשמור את ההוצאה. נסו שוב." };
  }

  const shares = splitEqually(totalAmountCents, participantIds);

  const participantRows = participantIds.map((participantId) => ({
    event_id: event.id,
    user_id: participantId,
    share_amount_cents: shares.get(participantId) ?? 0,
  }));

  const { error: participantsError } = await supabase
    .from("event_participants")
    .insert(participantRows);

  if (participantsError) {
    return { error: "לא הצלחנו לשמור את ההוצאה. נסו שוב." };
  }

  const ledgerRows = createEventLedgerEntries({
    groupId,
    eventId: event.id,
    paidByUserId,
    shares,
    currency,
  });

  if (ledgerRows.length > 0) {
    const { error: ledgerError } = await supabase.from("ledger_entries").insert(ledgerRows);

    if (ledgerError) {
      return { error: "לא הצלחנו לשמור את ההוצאה. נסו שוב." };
    }
  }

  redirect(`/groups/${groupId}`);
}

function mapEventRow(event: EventRow): EventWithPayer {
  const participants = event.event_participants;
  const participantCount = Array.isArray(participants)
    ? participants.length
    : participants
      ? 1
      : 0;

  return {
    id: event.id,
    group_id: event.group_id,
    title: event.title,
    description: event.description,
    total_amount_cents: event.total_amount_cents,
    paid_by_user_id: event.paid_by_user_id,
    event_date: event.event_date,
    currency: event.currency,
    split_type: event.split_type,
    status: event.status ?? "active",
    created_by: event.created_by,
    created_at: event.created_at,
    payer: normalizeProfile(event.profiles),
    participantCount,
  };
}

const RECENT_EVENTS_DISPLAY_LIMIT = 20;
const RECENT_EVENTS_FETCH_LIMIT = 100;

function isEventVisibleToUser(event: EventRow, userId: string): boolean {
  if (event.paid_by_user_id === userId || event.created_by === userId) {
    return true;
  }

  const participants = event.event_participants;
  if (Array.isArray(participants)) {
    return participants.some((participant) => participant.user_id === userId);
  }

  return participants?.user_id === userId;
}

/**
 * Takes the already-known current user id (the caller must have already
 * validated group access, e.g. via getGroupWithMembers) instead of calling
 * auth.getUser() again, to avoid a redundant auth round-trip.
 */
export async function getGroupEvents(
  groupId: string,
  currentUserId: string
): Promise<EventWithPayer[]> {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from("events")
    .select(
      `
      id,
      group_id,
      title,
      description,
      total_amount_cents,
      paid_by_user_id,
      event_date,
      currency,
      split_type,
      status,
      created_by,
      created_at,
      profiles:paid_by_user_id (
        id,
        display_name
      ),
      event_participants (
        user_id
      )
    `
    )
    .eq("group_id", groupId)
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(RECENT_EVENTS_FETCH_LIMIT);

  if (error || !events) {
    return [];
  }

  const visibleEvents = (events as EventRow[]).filter((event) =>
    isEventVisibleToUser(event, currentUserId)
  );

  return visibleEvents.slice(0, RECENT_EVENTS_DISPLAY_LIMIT).map(mapEventRow);
}

/**
 * Assumes the caller has already validated the current user's access to
 * this group (e.g. via getGroupWithMembers) before calling, to avoid a
 * redundant auth + group/members round-trip.
 */
export async function getEventDetail(
  groupId: string,
  eventId: string
): Promise<EventDetail | null> {
  const supabase = await createClient();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      `
      id,
      group_id,
      title,
      description,
      total_amount_cents,
      paid_by_user_id,
      event_date,
      currency,
      split_type,
      status,
      created_by,
      created_at,
      profiles:paid_by_user_id (
        id,
        display_name
      ),
      event_participants (
        user_id
      )
    `
    )
    .eq("id", eventId)
    .eq("group_id", groupId)
    .maybeSingle();

  if (eventError || !event) {
    return null;
  }

  const [
    { data: participantRows, error: participantsError },
    { data: ledgerEntries, error: ledgerError },
  ] = await Promise.all([
    supabase
      .from("event_participants")
      .select(
        `
        user_id,
        share_amount_cents,
        profiles (
          id,
          display_name
        )
      `
      )
      .eq("event_id", eventId),
    supabase
      .from("ledger_entries")
      .select(
        "id, group_id, source_type, source_id, from_user_id, to_user_id, amount_cents, currency, is_void, created_at"
      )
      .eq("group_id", groupId)
      .eq("source_type", "event")
      .eq("source_id", eventId)
      .order("created_at", { ascending: true }),
  ]);

  if (participantsError || ledgerError) {
    return null;
  }

  const participants: EventParticipantWithProfile[] = (
    (participantRows ?? []) as ParticipantRow[]
  ).map((row) => ({
    user_id: row.user_id,
    share_amount_cents: row.share_amount_cents,
    profile: normalizeProfile(row.profiles),
  }));

  const mappedEvent = mapEventRow(event as EventRow);

  return {
    ...mappedEvent,
    participants,
    ledgerEntries: (ledgerEntries ?? []) as LedgerEntry[],
  };
}

export async function cancelEventAction(
  groupId: string,
  eventId: string,
  _prevState: CancelEventState,
  _formData: FormData
): Promise<CancelEventState> {
  void _prevState;
  void _formData;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const groupData = await getGroupWithMembers(groupId);
  if (!groupData) {
    return { error: "אין גישה לקבוצה" };
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, group_id, status, created_by")
    .eq("id", eventId)
    .eq("group_id", groupId)
    .maybeSingle();

  if (eventError || !event) {
    return { error: "ההוצאה לא נמצאה" };
  }

  if (event.status === "cancelled") {
    return { error: "ההוצאה כבר מבוטלת" };
  }

  const currentMember = groupData.members.find((member) => member.user_id === user.id);
  const isAdmin = currentMember?.role === "admin";
  const isCreator = event.created_by === user.id;

  if (!isCreator && !isAdmin) {
    return { error: "אין לך הרשאה לבטל הוצאה זו" };
  }

  const { error: updateEventError } = await supabase
    .from("events")
    .update({ status: "cancelled" })
    .eq("id", eventId)
    .eq("group_id", groupId);

  if (updateEventError) {
    return { error: "לא הצלחנו לבטל את ההוצאה. נסו שוב." };
  }

  const { error: voidLedgerError } = await supabase
    .from("ledger_entries")
    .update({ is_void: true })
    .eq("group_id", groupId)
    .eq("source_type", "event")
    .eq("source_id", eventId);

  if (voidLedgerError) {
    return { error: "לא הצלחנו לבטל את ההוצאה. נסו שוב." };
  }

  redirect(`/groups/${groupId}/events/${eventId}`);
}
