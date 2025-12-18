import { z } from "zod";

export const searchInputSchema = z.object({
  q: z.string().optional().default(""),
  category: z.string().optional().default(""),
  area: z.string().optional().default(""),
});

export type SearchInput = z.input<typeof searchInputSchema>;

export function buildSearchUrl(raw: SearchInput) {
  const input = searchInputSchema.parse(raw);

  const q = input.q.trim();
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (input.category) params.set("category", input.category);
  if (input.area) params.set("area", input.area);

  // 検索時は1ページ目
  params.set("page", "1");

  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}
