import type { LayoutSize } from '@/schemas/layout-size';

export const ITEM_ARTWORK_SIZE = {
  small: 48,
  large: 104,
} as const satisfies Record<LayoutSize, number>;
