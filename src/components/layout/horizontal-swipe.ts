export const HORIZONTAL_SWIPE_THRESHOLD_PT = 40;

export type HorizontalSwipeDirection = 'left' | 'right';

export function resolveAdjacentHorizontalSwipeItem<Item extends { id: string }>({
  activeId,
  direction,
  items,
}: {
  activeId: string;
  direction: HorizontalSwipeDirection;
  items: readonly Item[];
}): Item | null {
  const activeIndex = items.findIndex((item) => item.id === activeId);
  if (activeIndex < 0) return null;

  const adjacentIndex = direction === 'left' ? activeIndex + 1 : activeIndex - 1;
  return items[adjacentIndex] ?? null;
}

export function resolveHorizontalSwipeDirection({
  translationX,
  translationY,
}: {
  translationX: number;
  translationY: number;
}): HorizontalSwipeDirection | null {
  const horizontalDistance = Math.abs(translationX);
  if (horizontalDistance < HORIZONTAL_SWIPE_THRESHOLD_PT || horizontalDistance <= Math.abs(translationY)) {
    return null;
  }

  return translationX < 0 ? 'left' : 'right';
}
