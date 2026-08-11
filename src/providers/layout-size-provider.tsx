import { createContext, use } from 'react';
import type { PropsWithChildren } from 'react';
import { useMedia } from 'tamagui';

import type { LayoutSize } from '@/schemas/layout-size';

const LayoutSizeContext = createContext<LayoutSize | null>(null);

export function LayoutSizeProvider({ children }: PropsWithChildren) {
  const media = useMedia();
  const layoutSize = media.md ? 'large' : 'small';

  return (
    <LayoutSizeContext value={layoutSize}>
      {children}
    </LayoutSizeContext>
  );
}

export function useLayoutSize() {
  const layoutSize = use(LayoutSizeContext);
  if (!layoutSize) throw new Error('useLayoutSize must be used within LayoutSizeProvider.');
  return layoutSize;
}
