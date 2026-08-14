import { useCallback, useMemo, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

export function useResponsiveGridRows<T, TLayout extends { columnCount: number }>(
  items: readonly T[],
  getLayout: (listWidth: number) => TLayout,
  getItemKey: (item: T) => string,
) {
  const [listWidth, setListWidth] = useState(0);

  const layout = getLayout(listWidth);

  const rows = useMemo(() => {
    const chunks: T[][] = [];
    for (let index = 0; index < items.length; index += layout.columnCount) {
      chunks.push(items.slice(index, index + layout.columnCount));
    }
    return chunks;
  }, [items, layout.columnCount]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setListWidth((currentWidth) => (currentWidth === width ? currentWidth : width));
  }, []);

  const keyExtractor = useCallback(
    (row: readonly T[], index: number) => {
      const first = row[0];
      return first ? getItemKey(first) : `grid-row-${index}`;
    },
    [getItemKey],
  );

  return { rows, listWidth, layout, handleLayout, keyExtractor };
}
