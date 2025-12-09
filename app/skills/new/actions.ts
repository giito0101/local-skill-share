"use server";

import { createSkill } from "@/lib/db/skill";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// server action: 状態を返す
export type FormState = { ok: boolean };

export async function createSkillAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const price = Number(formData.get("price"));
  const area = formData.get("area") as string;
  const ownerId = session.user.id;

  await createSkill({
    title,
    description,
    category,
    price,
    area,
    ownerId,
  });

  // 一覧をリロードする
  revalidatePath("/skills");

  return { ok: true };
}
