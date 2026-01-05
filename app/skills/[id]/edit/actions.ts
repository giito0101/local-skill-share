"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/require-session";
import { updateSkillSchema } from "@/lib/skills/validation";
import { put, del } from "@vercel/blob";

export type UpdateSkillState = {
  ok: boolean;
  errors: Record<string, string[]>;
  error?: string; // ✅ 追加
};

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

  // ✅ file を取得（input name="image" 想定）
  const file = formData.get("image");
  const imageFile = file instanceof File ? file : null;

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

  // ✅ 保存する最終 imageUrl（デフォは現状維持）
  let imageUrlToSave: string | null = skill.imageUrl ?? null;

  // image が存在していれば blob の削除が必要（差し替える場合のみ）
  if (imageFile && imageFile.size > 0) {
    // 1) 新しい画像をアップロード
    const blob = await put(
      `skills/${crypto.randomUUID()}-${imageFile.name}`,
      imageFile,
      {
        access: "public",
        addRandomSuffix: true, // これを付けるならUUIDはなくてもOK
      }
    );

    // 2) 旧画像が blob URL なら削除（任意）
    //    ※ 外部URLも混ざる可能性があるなら、消す前に条件を入れると安全
    if (skill.imageUrl) {
      try {
        await del(skill.imageUrl);
      } catch {
        // ここは「失敗しても更新自体は通す」方が体験が良いことが多い
      }
    }

    // 3) DBに保存するURLを新しいものに
    imageUrlToSave = blob.url;
  }

  // ⑤ 更新
  await prisma.skill.update({
    where: { id },
    data: {
      title,
      description,
      price,
      area,
      category,
      imageUrl: imageUrlToSave,
    },
  });

  revalidatePath(`/skills/${id}`);

  return { ok: true, errors: {} };
}
