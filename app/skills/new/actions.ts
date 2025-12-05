"use server";

import { createSkill } from "@/lib/db/skill";
import { revalidatePath } from "next/cache";

// server action: 状態を返す
export type FormState = { ok: boolean };

export async function createSkillAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const price = Number(formData.get("price"));
  const area = formData.get("area") as string;

  await createSkill({
    title,
    description,
    category,
    price,
    area,
  });

  // 一覧をリロードする
  revalidatePath("/skills");

  return { ok: true };
}
