export type Group = {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  created_by: string;
  created_at: string;
};

export type Profile = {
  id: string;
  display_name: string | null;
};

export type GroupMemberWithProfile = {
  role: string;
  status: string;
  profiles: Profile | null;
};
