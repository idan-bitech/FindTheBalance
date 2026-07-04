import Link from "next/link";
import { formatBalanceMainText } from "@/lib/balance-display";

type FriendBalanceRowProps = {
  groupId: string;
  userId: string;
  displayName: string;
  netAmountCents: number;
};

export function FriendBalanceRow({
  groupId,
  userId,
  displayName,
  netAmountCents,
}: FriendBalanceRowProps) {
  return (
    <li>
      <Link
        href={`/groups/${groupId}/friends/${userId}`}
        className="block rounded-2xl border border-neutral-200 px-5 py-3 transition hover:border-neutral-400 hover:bg-neutral-50"
      >
        <p className="font-medium text-neutral-950">
          {formatBalanceMainText(displayName, netAmountCents)}
        </p>
      </Link>
    </li>
  );
}
