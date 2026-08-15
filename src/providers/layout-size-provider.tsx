import { useMedia } from 'tamagui';

import type { LayoutSize } from '@/schemas/layout-size';

export function useLayoutSize(): LayoutSize {
  const media = useMedia();
  return media.md ? 'large' : 'small';
}
