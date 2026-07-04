export type Group = {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  created_by: string;
  created_at: string;
};

export type PronounPreference = "masculine" | "feminine" | "neutral";

export type Profile = {
  id: string;
  display_name: string | null;
  email?: string | null;
  pronoun_preference?: PronounPreference | null;
};

export type GroupMemberWithProfile = {
  user_id: string;
  role: string;
  status: string;
  profiles: Profile | null;
};

export type Event = {
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
};

export type EventWithPayer = Event & {
  payer: Profile | null;
  participantCount: number;
};

export type EventParticipantWithProfile = {
  user_id: string;
  share_amount_cents: number;
  profile: Profile | null;
};

export type EventDetail = EventWithPayer & {
  participants: EventParticipantWithProfile[];
  ledgerEntries: LedgerEntry[];
};

export type LedgerEntry = {
  id: string;
  group_id: string;
  source_type: string;
  source_id: string;
  from_user_id: string;
  to_user_id: string;
  amount_cents: number;
  currency: string;
  is_void?: boolean;
  created_at: string;
};

export type Settlement = {
  id: string;
  group_id: string;
  paid_by_user_id: string;
  paid_to_user_id: string;
  amount_cents: number;
  currency: string;
  note: string | null;
  created_by: string;
  settled_at: string;
  created_at: string;
};

export type MemberBalance = {
  userId: string;
  displayName: string;
  netAmountCents: number;
};

export type GroupInviteLink = {
  id: string;
  group_id: string;
  token: string;
  expires_at: string;
  uses_count: number;
  max_uses: number | null;
  is_active: boolean;
  created_at: string;
};

export type InvitePreview = {
  group_id: string;
  group_name: string;
};
