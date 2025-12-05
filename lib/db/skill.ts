import { prisma } from "@/lib/prisma";

export async function createSkill(data: {
  title: string;
  description: string;
  category: string;
  price: number;
  area: string;
  ownerId: string;
}) {
  return prisma.skill.create({ data });
}

export async function getSkillById(id: number) {
  return prisma.skill.findUnique({
    where: { id },
  });
}
