export const HORIZONTAL_SWIPE_DISTANCE_THRESHOLD_PT = 40;
export const HORIZONTAL_SWIPE_DISTANCE_CAPTURE_OFFSET_PT = 8;
export const HORIZONTAL_SWIPE_FLICK_MIN_DISTANCE_PT = 12;
export const HORIZONTAL_SWIPE_FLICK_VELOCITY_THRESHOLD_PT_PER_SECOND = 800;
export const HORIZONTAL_SWIPE_BOUNDARY_MAX_PROGRESS = 0.12;

export type HorizontalSwipeDirection = 'left' | 'right';

export type HorizontalSwipeMotion = {
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
};

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

export function resolveHorizontalSwipeDirection(motion: HorizontalSwipeMotion): HorizontalSwipeDirection | null {
  const { translationX, translationY, velocityX, velocityY } = motion;
  const horizontalDistance = Math.abs(translationX);

  if (horizontalDistance <= Math.abs(translationY)) return null;

  if (horizontalDistance >= HORIZONTAL_SWIPE_DISTANCE_THRESHOLD_PT) {
    return translationX < 0 ? 'left' : 'right';
  }

  if (horizontalDistance < HORIZONTAL_SWIPE_FLICK_MIN_DISTANCE_PT) return null;

  if (Math.abs(velocityX) <= Math.abs(velocityY)) return null;

  if (Math.abs(velocityX) < HORIZONTAL_SWIPE_FLICK_VELOCITY_THRESHOLD_PT_PER_SECOND) return null;

  if (Math.sign(translationX) !== Math.sign(velocityX)) return null;

  return translationX < 0 ? 'left' : 'right';
}

export function resolveHorizontalSwipeProgress(translationX: number, contentWidth: number) {
  if (contentWidth <= 0) return 0;
  return Math.min(1, Math.abs(translationX) / contentWidth);
}

export function resolveHorizontalSwipeBoundaryProgress(translationX: number, contentWidth: number) {
  const progress = resolveHorizontalSwipeProgress(translationX, contentWidth);
  return HORIZONTAL_SWIPE_BOUNDARY_MAX_PROGRESS * (1 - Math.exp(
    -progress / HORIZONTAL_SWIPE_BOUNDARY_MAX_PROGRESS,
  ));
}
