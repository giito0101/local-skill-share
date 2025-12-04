"use server";

import { revalidatePath } from "next/cache";
import { CreateUser } from "@/lib/schemas/user";

export type CreateUserState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createUserAction(
  _prevState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  const raw = Object.fromEntries(formData);
  const result = CreateUser.safeParse(raw);

  if (!result.success) {
    const flat = result.error.flatten();
    return { ok: false, errors: flat.fieldErrors };
  }

  // ここでDB保存など（例）:
  // await db.user.create({ data: result.data });

  revalidatePath("/users");
  return { ok: true, message: "ユーザーを作成しました" };
}
