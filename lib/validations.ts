import { z } from "zod";

export const SkillSearchSchema = z.object({
  q: z.string().trim().min(1).optional(),
  category: z.string().trim().optional(),
  area: z.string().trim().optional(),
  page: z
    .string()
    .transform((v) => Number(v))
    .pipe(z.number().int().min(1))
    .optional(),
});

export type SkillSearchInput = z.infer<typeof SkillSearchSchema>;
