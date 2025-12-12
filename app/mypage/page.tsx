import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./components/ProfileForm";
import { SkillList } from "./components/SkillList";
import { ReservationList } from "./components/ReservationList";
import { requireSession } from "@/lib/require-session";

export default async function MyPage() {
  const session = await requireSession({ callbackUrl: `/mypage` });

  const userId = session.user.id;

  const [user, skills, reservations] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        bio: true,
        image: true,
      },
    }),
    prisma.skill.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        title: true,
        description: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.reservation.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        skill: {
          select: {
            title: true,
            owner: { select: { name: true } },
          },
        },
        owner: { select: { name: true } },
        conversation: { select: { id: true } },
      },
      orderBy: { date: "desc" },
    }),
  ]);

  if (!user) {
    redirect("/"); // ユーザーが見つからない異常系
  }

  const reservationItems = reservations.map((r) => ({
    id: r.id,
    date: r.date.toLocaleString("ja-JP"),
    message: r.message ?? "（メッセージなし）",
    status: r.status,
    skillTitle: r.skill.title,
    providerName: r.skill.owner?.name ?? "名無しさん",
    conversationId: r.conversation?.id ?? null,
  }));

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <section>
        <h1 className="text-xl font-semibold mb-4">マイページ</h1>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">プロフィール</h2>
        <ProfileForm
          defaultName={user.name ?? ""}
          defaultBio={user.bio}
          defaultImageUrl={user.image}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">あなたのスキル</h2>
        <SkillList skills={skills} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">予約リクエスト</h2>
        <ReservationList reservations={reservationItems} />
      </section>
    </div>
  );
}
