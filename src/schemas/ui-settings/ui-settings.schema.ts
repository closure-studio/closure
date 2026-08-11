import * as v from 'valibot';

export const layoutSizeSchema = v.picklist(['small', 'large']);

export const uiSettingsSchema = v.object({
  layoutSize: layoutSizeSchema,
});

export type LayoutSize = v.InferOutput<typeof layoutSizeSchema>;
export type UiSettings = v.InferOutput<typeof uiSettingsSchema>;
