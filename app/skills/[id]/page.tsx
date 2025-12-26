// app/skills/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "./review-form";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ReservedToast } from "./reserved-toast";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SkillDetailPage({ params }: Props) {
  const { id } = await params;

  if (typeof id !== "string" || id.trim() === "") {
    notFound();
  }

  // ✅ ログインしてるなら userId を取る（未ログインは null のまま）
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ?? null;

  const skill = await prisma.skill.findUnique({
    where: { id: id },
    include: {
      owner: true,
      reviews: {
        include: { owner: true }, // ← schema に合わせる
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!skill) redirect("/");

  // ✅ 自分のスキルなら notFound（一覧からも見えない扱い）
  if (viewerId && skill.ownerId === viewerId) {
    notFound();
  }

  if (!skill) notFound();

  const avgRating =
    skill.reviews.length === 0
      ? null
      : skill.reviews.reduce((sum, r) => sum + r.rating, 0) /
        skill.reviews.length;

  return (
    <>
      <ReservedToast />
      <div className="max-w-3xl mx-auto py-10 space-y-8">
        {/* 上部：スキル情報 */}
        <section className="space-y-4">
          {/* 画像 */}
          {skill.imageUrl && (
            <div className="relative w-full aspect-video overflow-hidden rounded-md">
              <Image
                src={skill.imageUrl}
                alt={skill.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{skill.title}</h1>
            <p className="text-muted-foreground">{skill.description}</p>
            <p>料金: {skill.price.toLocaleString()}円</p>
            <p>エリア: {skill.area}</p>

            {/* 平均評価 */}
            <div className="mt-2">
              {avgRating === null ? (
                <p>まだレビューはありません</p>
              ) : (
                <p>
                  平均評価: {avgRating.toFixed(1)} / 5（{skill.reviews.length}
                  件）
                </p>
              )}
            </div>

            {/* 予約ボタン */}
            <div className="mt-4">
              <Link href={`/skills/${skill.id}/reserve`}>
                <Button>このスキルを予約する</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 下部：レビュー一覧＋投稿フォーム */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">レビュー一覧</h2>

          {skill.reviews.length === 0 && (
            <p className="text-sm text-muted-foreground">
              まだレビューはありません。
            </p>
          )}

          <ul className="space-y-3">
            {skill.reviews.map((review) => (
              <li key={review.id} className="border rounded-md p-3">
                <p className="font-medium">
                  {review.owner.name ?? "匿名ユーザー"} / ★{review.rating}
                </p>
                {review.comment && (
                  <p className="text-sm mt-1 whitespace-pre-line">
                    {review.comment}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {review.createdAt.toLocaleDateString("ja-JP")}
                </p>
              </li>
            ))}
          </ul>

          {/* レビュー投稿フォーム（Server Action版） */}
          <ReviewForm skillId={skill.id} />
        </section>
      </div>
    </>
  );
}
