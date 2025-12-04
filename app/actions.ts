"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSkillAction(formData: FormData) {
  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "");
  const price = Number(formData.get("price") || 0);
  const area = String(formData.get("area") || "");

  if (!title || !description || !area || price <= 0) {
    throw new Error("Invalid input");
  }

  await prisma.skill.create({
    data: { title, description, price, area },
  });

  // トップページのキャッシュを最新化（ISR/キャッシュ戦略に関わらず安全）
  revalidatePath("/");
}

export async function deleteSkillAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  await prisma.skill.delete({ where: { id } });
  revalidatePath("/");
}
