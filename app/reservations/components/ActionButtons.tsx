"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function ActionButtons() {
  const { pending } = useFormStatus();

  return (
    <div className="flex gap-2">
      <Button
        name="intent"
        value="approve"
        type="submit"
        disabled={pending}
        size="sm"
        variant="outline"
      >
        {pending ? "処理中..." : "承認"}
      </Button>
      <Button
        name="intent"
        value="cancel"
        type="submit"
        disabled={pending}
        size="sm"
        variant="destructive"
      >
        {pending ? "処理中..." : "キャンセル"}
      </Button>
    </div>
  );
}
