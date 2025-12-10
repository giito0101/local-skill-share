"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateReservationStatusAction,
  type ReservationActionState,
} from "../actions";

type ReservationItem = {
  id: string;
  date: string; // page.tsx 側で toLocaleString 済みのものを渡すと楽
  message: string;
  status: "PENDING" | "CONFIRMED" | "CANCELED";
  skillTitle: string;
  requesterName: string;
};

function ActionButtons({ reservationId }: { reservationId: string }) {
  const { pending } = useFormStatus();

  return (
    <div className="flex gap-2">
      <button
        name="intent"
        value="approve"
        type="submit"
        disabled={pending}
        className="text-xs border rounded px-2 py-1"
      >
        {pending ? "処理中..." : "承認"}
      </button>
      <button
        name="intent"
        value="cancel"
        type="submit"
        disabled={pending}
        className="text-xs border rounded px-2 py-1 text-red-600"
      >
        {pending ? "処理中..." : "キャンセル"}
      </button>
      <input type="hidden" name="reservationId" value={reservationId} />
    </div>
  );
}

const initialState: ReservationActionState = { ok: false };

type Props = {
  reservations: ReservationItem[];
};

export function ReservationList({ reservations }: Props) {
  const [state, formAction] = useActionState(
    updateReservationStatusAction,
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
        {reservations.map((r) => (
          <li
            key={r.id}
            className="rounded-lg border px-4 py-3 text-sm space-y-1"
          >
            <div className="flex justify-between">
              <span className="font-medium">{r.skillTitle}</span>
              <span className="text-xs text-gray-500">{r.date}</span>
            </div>
            <div className="text-xs text-gray-600">
              依頼者: {r.requesterName}
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
                  <ActionButtons reservationId={r.id} />
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
