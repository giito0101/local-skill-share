import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .string()
    .regex(/^[1-5]$/, "1〜5で入力してください")
    .transform((v) => Number(v)),
  comment: z.string().max(2000).optional().or(z.literal("")),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
