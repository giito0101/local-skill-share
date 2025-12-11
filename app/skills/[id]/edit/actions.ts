"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export type UpdateSkillState = {
  ok: boolean;
  error?: string;
};

export async function updateSkillAction(
  prevState: UpdateSkillState,
  formData: FormData
): Promise<UpdateSkillState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "ログインしてください。" };
  }

  const id = Number(formData.get("id"));
  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const description =
    (formData.get("description") as string | null)?.trim() ?? "";

  if (!title) {
    return { ok: false, error: "タイトルは必須です。" };
  }

  const skill = await prisma.skill.findUnique({ where: { id } });
  if (!skill || skill.ownerId !== session.user.id) {
    return { ok: false, error: "このスキルは編集できません。" };
  }

  await prisma.skill.update({
    where: { id },
    data: {
      title,
      description,
    },
  });

  // 成功したらマイページに戻す
  redirect("/mypage");
}
