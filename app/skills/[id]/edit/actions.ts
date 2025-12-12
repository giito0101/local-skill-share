"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { redirect } from "next/navigation";

export type UpdateSkillState = {
  ok: boolean;
  error?: string;
};

export async function updateSkillAction(
  prevState: UpdateSkillState,
  formData: FormData
): Promise<UpdateSkillState> {
  const id = Number(formData.get("id"));
  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const description =
    (formData.get("description") as string | null)?.trim() ?? "";

  const session = await requireSession({ callbackUrl: `/skills/${id}/edit` });

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
