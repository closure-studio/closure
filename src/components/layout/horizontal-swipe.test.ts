import {
  resolveAdjacentHorizontalSwipeItem,
  resolveHorizontalSwipeDirection,
} from './horizontal-swipe';

describe('resolveAdjacentHorizontalSwipeItem', () => {
  const items = [{ id: 'first' }, { id: 'middle' }, { id: 'last' }] as const;

  it('moves forward for a left swipe and backward for a right swipe', () => {
    expect(resolveAdjacentHorizontalSwipeItem({
      activeId: 'middle',
      direction: 'left',
      items,
    }))?.toBe(items[2]);
    expect(resolveAdjacentHorizontalSwipeItem({
      activeId: 'middle',
      direction: 'right',
      items,
    }))?.toBe(items[0]);
  });

  it.each([
    { activeId: 'first', direction: 'right' },
    { activeId: 'last', direction: 'left' },
    { activeId: 'missing', direction: 'left' },
  ] as const)('does not move beyond the ordered items for $activeId/$direction', (gesture) => {
    expect(resolveAdjacentHorizontalSwipeItem({ ...gesture, items })).toBeNull();
  });

  it('returns no target for an empty item collection', () => {
    expect(resolveAdjacentHorizontalSwipeItem({
      activeId: 'missing',
      direction: 'left',
      items: [],
    })).toBeNull();
  });
});

describe('resolveHorizontalSwipeDirection', () => {
  it('resolves horizontal swipes at the threshold', () => {
    expect(resolveHorizontalSwipeDirection({ translationX: -40, translationY: 4 })).toBe('left');
    expect(resolveHorizontalSwipeDirection({ translationX: 40, translationY: 4 })).toBe('right');
  });

  it.each([
    { translationX: 39, translationY: 0 },
    { translationX: 60, translationY: 60 },
    { translationX: 40, translationY: 80 },
  ])('rejects a gesture below the threshold or dominated by vertical movement', (translation) => {
    expect(resolveHorizontalSwipeDirection(translation)).toBeNull();
  });
});
