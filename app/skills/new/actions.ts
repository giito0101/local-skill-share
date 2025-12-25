"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import { authOptions } from "@/lib/auth";
import { createSkillSchema } from "@/lib/skills/validation";

export type FormState = {
  ok: boolean;
  errors?: Record<string, string[]>;
};

export async function createSkillAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // ① 認証チェック
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      ok: false,
      errors: {
        _form: ["スキルを投稿するにはログインが必要です。"],
      },
    };
  }

  // ② Zod でテキスト項目をバリデーション
  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    area: formData.get("area"),
    category: formData.get("category"),
  };

  const result = createSkillSchema.safeParse(raw);
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const data = result.data; // price は number などに変換済み想定

  // ③ 画像（任意）を Vercel Blob にアップロード
  let imageUrl: string | undefined = undefined;
  const file = formData.get("image") as File | null;

  // ★ 開発中はここの Blob アップロードをコメントアウトしておけばトークン不要
  if (file && file.size > 0) {
    const blob = await put(`skills/${crypto.randomUUID()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    imageUrl = blob.url;
  }

  // ④ Prisma で Skill 作成
  const skill = await prisma.skill.create({
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      area: data.area,
      category: data.category as any, // enum 型なら as const 側と合わせてOK
      imageUrl,
      ownerId: session.user.id,
    },
  });

  // ⑤ 一覧を再検証 & 詳細ページへリダイレクト
  revalidatePath("/skills");
  redirect(`/skills/${skill.id}/edit`);
}
