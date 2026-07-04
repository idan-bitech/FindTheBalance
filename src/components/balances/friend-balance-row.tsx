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
  const isOwedToMe = netAmountCents > 0;
  const toneClassName = isOwedToMe
    ? "border-emerald-200 bg-emerald-50/60 hover:border-emerald-300 hover:bg-emerald-50"
    : "border-amber-200 bg-amber-50/60 hover:border-amber-300 hover:bg-amber-50";

  return (
    <li>
      <Link
        href={`/groups/${groupId}/friends/${userId}`}
        className={`block rounded-2xl border px-5 py-3 transition ${toneClassName}`}
      >
        <p className="font-medium text-stone-950">
          {formatBalanceMainText(displayName, netAmountCents)}
        </p>
      </Link>
    </li>
  );
}
