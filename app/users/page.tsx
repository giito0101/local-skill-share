"use client";

import { useActionState } from "react";
import { createUserAction, type CreateUserState } from "./actions";

const initialState: CreateUserState = { ok: false };

export default function UsersPage() {
  const [state, formAction, pending] = useActionState(createUserAction, initialState);

  return (
    <main style={{ padding: 24, maxWidth: 480 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>ユーザー作成</h1>

      {state.ok && state.message && (
        <p role="status" style={{ color: "green" }}>{state.message}</p>
      )}

      <form action={formAction} style={{ display: "grid", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 14 }}>名前</label>
          <input name="name" style={{ border: "1px solid #ccc", padding: 6, width: "100%" }} />
          {state.errors?.name?.[0] && (
            <p style={{ color: "crimson", fontSize: 12 }}>{state.errors.name[0]}</p>
          )}
        </div>

        <div>
          <label style={{ display: "block", fontSize: 14 }}>年齢</label>
          <input
            name="age"
            inputMode="numeric"
            style={{ border: "1px solid #ccc", padding: 6, width: "100%" }}
          />
          {state.errors?.age?.[0] && (
            <p style={{ color: "crimson", fontSize: 12 }}>{state.errors.age[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          style={{ border: "1px solid #ccc", padding: "6px 12px", borderRadius: 6 }}
        >
          {pending ? "送信中..." : "作成"}
        </button>
      </form>
    </main>
  );
}
