import * as v from 'valibot';

export const layoutSizeSchema = v.picklist(['small', 'large']);

export type LayoutSize = v.InferOutput<typeof layoutSizeSchema>;
