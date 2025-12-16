"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { requireSession } from "@/lib/require-session";

// ★ URL前提だった imageUrl を削除して、name / bio だけ Zod で見る
const profileSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  bio: z.string().max(500, "自己紹介は500文字以内にしてください").optional(),
});

export type ProfileFormState = {
  ok: boolean;
  errors?: string[];
};

export async function updateProfileAction(
  prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  try {
    const session = await requireSession({ callbackUrl: `/mypage` });
    const user = session.user;

    // name / bio は Zod でチェック
    const parsed = profileSchema.safeParse({
      name: formData.get("name"),
      bio: formData.get("bio"),
    });

    if (!parsed.success) {
      return {
        ok: false,
        errors: parsed.error.issues.map((i) => i.message),
      };
    }

    const { name, bio } = parsed.data;

    // ★ ファイルは Zod ではなく生で扱う（Skill登録と同じノリ）
    const imageFile = formData.get("image") as File | null; // ← ProfileForm の input name と合わせる

    // 既存ユーザー情報を取得して、何もアップロードされなければそれを維持する
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { image: true }, // User モデルのフィールド名に合わせて変更してね
    });

    let imageUrlToSave: string | null =
      (currentUser?.image as string | null) ?? null;

    // 新しいファイルが選択されていれば Blob にアップロード
    if (imageFile && imageFile.size > 0) {
      const { url } = await put(
        `avatars/${crypto.randomUUID()}-${imageFile.name}`,
        imageFile,
        {
          access: "public",
        }
      );
      imageUrlToSave = url;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        bio: bio ?? null,
        image: imageUrlToSave, // ★ DB側は普通の String のままでOK
      },
    });

    revalidatePath("/mypage");

    return { ok: true };
  } catch (e: any) {
    console.error(e);
    return {
      ok: false,
      errors: ["プロフィールの更新に失敗しました"],
    };
  }
}

const skillIdSchema = z.object({
  skillId: z.coerce.number(),
});

export type DeleteSkillState = {
  ok: boolean;
  error?: string;
};

export async function deleteSkillAction(
  prevState: DeleteSkillState,
  formData: FormData
): Promise<DeleteSkillState> {
  try {
    const session = await requireSession({ callbackUrl: `/mypage` });
    const user = session.user;

    const parsed = skillIdSchema.safeParse({
      skillId: formData.get("skillId"),
    });

    if (!parsed.success) {
      return { ok: false, error: "削除リクエストが不正です。" };
    }

    const { skillId } = parsed.data;

    const reservationCount = await prisma.reservation.count({
      where: { skillId },
    });

    if (reservationCount > 0) {
      return { ok: false, error: "予約が入っているスキルは削除できません。" };
    }

    // 自分のスキルか確認（念のため）
    const skill = await prisma.skill.findFirst({
      where: { id: skillId, ownerId: user.id },
      select: { id: true },
    });

    if (!skill) {
      return { ok: false, error: "スキルが見つからないか、権限がありません。" };
    }

    await prisma.skill.delete({
      where: { id: skillId },
    });

    // /mypage を再フェッチしてリストを更新
    revalidatePath("/mypage");

    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "スキルの削除に失敗しました。" };
  }
}

const reservationSchema = z.object({
  reservationId: z.string(),
  intent: z.enum(["approve", "cancel"]),
});

export type ReservationActionState = {
  ok: boolean;
  error?: string;
};

export async function reviewReservationRequestAction(
  prev: ReservationActionState,
  formData: FormData
): Promise<ReservationActionState> {
  try {
    const session = await requireSession({ callbackUrl: `/mypage` });
    const user = session.user;

    const parsed = reservationSchema.safeParse({
      reservationId: formData.get("reservationId"),
      intent: formData.get("intent"),
    });

    if (!parsed.success) {
      return { ok: false, error: "パラメータが不正です" };
    }

    const { reservationId, intent } = parsed.data;

    // まず予約 + 関連スキル取得（スキル owner が自分か確認する）
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        skill: { select: { ownerId: true } },
      },
    });

    if (!reservation || reservation.skill.ownerId !== user.id) {
      return { ok: false, error: "権限のない予約です" };
    }

    const nextStatus = intent === "approve" ? "CONFIRMED" : "CANCELED";

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: nextStatus },
    });

    revalidatePath("/mypage");

    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "更新に失敗しました" };
  }
}
