import * as v from 'valibot';

const materialCategorySchema = v.picklist(['基础素材', '进阶素材', '芯片', '技巧概要']);

export const materialSchema = v.object({
  id: v.string(),
  name: v.string(),
  tier: v.number(),
  owned: v.number(),
  needed: v.number(),
  category: materialCategorySchema,
});

export type Material = v.InferOutput<typeof materialSchema>;
