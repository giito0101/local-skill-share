"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/require-session";
import { updateSkillSchema } from "@/lib/validators/skill";
import type { FieldErrors } from "@/lib/validators/_utils";

export type UpdateSkillState = {
  ok: boolean;
  errors: Record<string, string[]>;
};

const initialErrors: Record<string, string[]> = {};

export async function updateSkillAction(
  prevState: UpdateSkillState,
  formData: FormData
): Promise<UpdateSkillState> {
  // ① 認証（必要なら）
  const session = await requireSession({ callbackUrl: "/" });

  // ② FormData -> raw
  const raw = {
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    area: formData.get("area"),
    category: formData.get("category"),
  };

  // ③ validation
  const parsed = updateSkillSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, title, description, price, area, category } = parsed.data;

  // ④ 対象スキル取得（ownerチェックしたいならここ）
  const skill = await prisma.skill.findUnique({ where: { id } });
  if (!skill) {
    return { ok: false, errors: { _form: ["スキルが見つかりません"] } };
  }

  // 例: 自分の投稿だけ編集可（ownerIdの型に合わせて調整）
  if (skill.ownerId !== session.user.id) {
    return { ok: false, errors: { _form: ["権限がありません"] } };
  }

  // ⑤ 更新
  await prisma.skill.update({
    where: { id },
    data: { title, description, price, area, category },
  });

  revalidatePath(`/skills/${id}`);

  return { ok: true, errors: {} };
}
