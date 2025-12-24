import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { reserveAction } from "./actions";
import { SubmitButton } from "./submit-button";

type Props = {
  skillId: string;
};

// ※ "use client" は付けない（Server Component）
export function ReservationForm({ skillId }: Props) {
  return (
    <form action={reserveAction} className="space-y-4">
      {/* Server Action に渡すための hidden フィールド */}
      <input type="hidden" name="skillId" value={skillId} />

      <div className="space-y-1">
        <Label htmlFor="date">希望日時</Label>
        <Input id="date" name="date" type="datetime-local" required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="message">メッセージ（任意）</Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder="希望内容や相談したいことがあれば書いてください"
        />
      </div>

      {/* pending 状態だけ Client Component で扱う */}
      <SubmitButton />
    </form>
  );
}
