import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { EditSkillForm } from "./EditSkillForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditSkillPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const { id } = await params;

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
