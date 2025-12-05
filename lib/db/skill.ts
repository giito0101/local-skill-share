import { prisma } from "@/lib/prisma";

export async function createSkill(data: {
  title: string;
  description: string;
  category: string;
  price: number;
  area: string;
}) {
  return prisma.skill.create({ data });
}
