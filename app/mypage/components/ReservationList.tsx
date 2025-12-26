"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
  reviewReservationRequestAction,
  type ReservationActionState,
} from "../actions";

type ReservationItem = {
  id: string;
  date: string; // page.tsx 側で toLocaleString 済みのものを渡すと楽
  message: string;
  status: "PENDING" | "CONFIRMED" | "CANCELED";
  skillTitle: string;
  providerName: string;
  conversationId: string | null;
};

function ActionButtons({ target }: { target: string }) {
  const { pending } = useFormStatus();
  const router = useRouter();

  return (
    <div className="flex gap-2">
      <button
        name="intent"
        value="cancel"
        type="submit"
        disabled={pending}
        className="text-xs border rounded px-2 py-1 text-red-600"
      >
        {pending ? "処理中..." : "キャンセル"}
      </button>
      <button
        type="button"
        onClick={() => router.push(target)}
        className="text-xs border rounded px-2 py-1"
      >
        チャットする
      </button>
    </div>
  );
}

const initialState: ReservationActionState = { ok: false };

type Props = {
  reservations: ReservationItem[];
};

export function ReservationList({ reservations }: Props) {
  const [state, formAction] = useActionState(
    reviewReservationRequestAction,
    initialState
  );

  if (reservations.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        あなたのスキルへの予約はまだありません。
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}

      <ul className="space-y-3">
        {reservations.map((r) => {
          const target = r.conversationId
            ? `/conversations/${r.conversationId}`
            : `/conversations/start?reservationId=${r.id}`;
          return (
            <li
              key={r.id}
              data-testid="reservation-item"
              className="rounded-lg border px-4 py-3 text-sm space-y-1"
            >
              <div className="flex justify-between">
                <span className="font-medium">{r.skillTitle}</span>
                <span className="text-xs text-gray-500">{r.date}</span>
              </div>
              <div className="text-xs text-gray-600">
                提供者: {r.providerName}
              </div>
              <p className="text-xs mt-1">{r.message}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs">
                  状態:{" "}
                  {r.status === "PENDING"
                    ? "保留中"
                    : r.status === "CONFIRMED"
                    ? "承認済み"
                    : "キャンセル済み"}
                </span>

                {r.status === "PENDING" && (
                  <form action={formAction}>
                    <ActionButtons target={target} />
                  </form>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
