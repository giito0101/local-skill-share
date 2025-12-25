"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} data-testid="reserveSubmit">
      {pending ? "送信中..." : "予約リクエストを送る"}
    </Button>
  );
}
