import { z } from "zod";

export const reserveSchema = z.object({
  skillId: z.string(),
  date: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "日時が不正です"),
  message: z.string().max(2000).optional().or(z.literal("")),
});

export type ReserveInput = z.infer<typeof reserveSchema>;

export function parseReserve(raw: unknown) {
  return reserveSchema.safeParse(raw);
}

export function toReservationData(input: ReserveInput) {
  return {
    skillId: input.skillId,
    date: new Date(input.date),
    message: input.message ? input.message : null, // "" → null
  };
}
