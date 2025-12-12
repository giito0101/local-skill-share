import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditSkillForm } from "./EditSkillForm";
import { requireSession } from "@/lib/require-session";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditSkillPage({ params }: Props) {
  const { id } = await params;

  const session = await requireSession({
    callbackUrl: `/skills/${id}}/edit`,
  });

  const skillId = Number(id);
  if (Number.isNaN(skillId)) notFound();

  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
  });

  if (!skill) notFound();
  if (skill.ownerId !== session.user.id) {
    // 自分のスキル以外は編集させない
    redirect("/");
  }

  return (
    <div className="max-w-xl mx-auto py-8 space-y-4">
      <h1 className="text-lg font-semibold">スキルを編集</h1>
      <EditSkillForm
        id={skill.id}
        defaultTitle={skill.title}
        defaultDescription={skill.description ?? ""}
      />
      <a href="/mypage" className="text-xs text-blue-600">
        マイページに戻る
      </a>
    </div>
  );
}
