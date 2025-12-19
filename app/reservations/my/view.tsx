"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Reservation, Skill } from "@/app/generated/prisma/client";
import { useFormStatus } from "react-dom";
import {
  formatReservationDate,
  statusLabel,
} from "@/app/reservations/my/format";

type ReservationWithSkill = Reservation & {
  skill: Pick<Skill, "id" | "title">;
  // 追加: 提供者視点の「予約された予約ID」
  providerReservationId?: string | null;
};

// ★ さっきの UI をコンポーネント化
function ActionButtons() {
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
    </div>
  );
}

export function MyReservationsView(props: {
  tab: "future" | "past";
  page: number;
  totalPages: number;
  reservations: ReservationWithSkill[];
}) {
  const { tab, page, totalPages, reservations } = props;
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    params.set("page", "1");
    router.push(`/reservations/my?${params.toString()}`);
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    params.set("tab", tab);
    router.push(`/reservations/my?${params.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-semibold mb-4">自分の予約</h1>

      {/* タブ: 未来 / 過去 */}
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="future">これからの予約</TabsTrigger>
          <TabsTrigger value="past">過去の予約</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日時</TableHead>
                <TableHead>スキル</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    予約はありません。
                  </TableCell>
                </TableRow>
              )}

              {reservations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{formatReservationDate(r.date)}</TableCell>
                  <TableCell>{r.skill.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        r.status === "CANCELED" ? "secondary" : "default"
                      }
                    >
                      {statusLabel(r.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/reservations/${r.id}`}>詳細</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* ページネーション */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              ページ {page} / {totalPages}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
              >
                前へ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
              >
                次へ
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
