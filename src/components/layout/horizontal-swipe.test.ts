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
  it('resolves a distance swipe at exactly 40pt in either direction', () => {
    expect(resolveHorizontalSwipeDirection({
      translationX: 40,
      translationY: 0,
      velocityX: 0,
      velocityY: 0,
    })).toBe('right');
    expect(resolveHorizontalSwipeDirection({
      translationX: -40,
      translationY: 4,
      velocityX: 0,
      velocityY: 0,
    })).toBe('left');
  });

  it('rejects a 39pt movement with slow velocity', () => {
    expect(resolveHorizontalSwipeDirection({
      translationX: 39,
      translationY: 0,
      velocityX: 799,
      velocityY: 0,
    })).toBeNull();
  });

  it('resolves a short fast flick in either direction', () => {
    expect(resolveHorizontalSwipeDirection({
      translationX: 20,
      translationY: 2,
      velocityX: 1200,
      velocityY: 50,
    })).toBe('right');
    expect(resolveHorizontalSwipeDirection({
      translationX: -20,
      translationY: 2,
      velocityX: -1200,
      velocityY: 50,
    })).toBe('left');
  });

  it('resolves a flick at the exact minimum distance and velocity boundaries', () => {
    expect(resolveHorizontalSwipeDirection({
      translationX: 12,
      translationY: 0,
      velocityX: 800,
      velocityY: 0,
    })).toBe('right');
    expect(resolveHorizontalSwipeDirection({
      translationX: -12,
      translationY: 0,
      velocityX: -800,
      velocityY: 0,
    })).toBe('left');
  });

  it('rejects movements below the minimum flick distance even at high velocity', () => {
    expect(resolveHorizontalSwipeDirection({
      translationX: 11.99,
      translationY: 0,
      velocityX: 2000,
      velocityY: 0,
    })).toBeNull();
    expect(resolveHorizontalSwipeDirection({
      translationX: 0,
      translationY: 0,
      velocityX: 2000,
      velocityY: 0,
    })).toBeNull();
  });

  it('rejects flicks below the velocity threshold', () => {
    expect(resolveHorizontalSwipeDirection({
      translationX: 20,
      translationY: 2,
      velocityX: 700,
      velocityY: 0,
    })).toBeNull();
    expect(resolveHorizontalSwipeDirection({
      translationX: 20,
      translationY: 2,
      velocityX: 799,
      velocityY: 0,
    })).toBeNull();
  });

  it('rejects flicks whose velocity is not strictly horizontally dominant', () => {
    expect(resolveHorizontalSwipeDirection({
      translationX: 20,
      translationY: 2,
      velocityX: 800,
      velocityY: 800,
    })).toBeNull();
    expect(resolveHorizontalSwipeDirection({
      translationX: 20,
      translationY: 2,
      velocityX: 0,
      velocityY: 1500,
    })).toBeNull();
  });

  it.each([
    { translationX: 20, translationY: 21, velocityX: 1200, velocityY: 0 },
    { translationX: 20, translationY: 20, velocityX: 1200, velocityY: 0 },
    { translationX: 60, translationY: 60, velocityX: 1200, velocityY: 0 },
  ])('rejects flicks whose translation is not strictly horizontally dominant', (motion) => {
    expect(resolveHorizontalSwipeDirection(motion)).toBeNull();
  });

  it('rejects a short flick whose translation and velocity disagree in direction', () => {
    expect(resolveHorizontalSwipeDirection({
      translationX: 20,
      translationY: 2,
      velocityX: -1200,
      velocityY: 0,
    })).toBeNull();
  });

  it('prefers the distance path after 40pt regardless of lift-off velocity', () => {
    expect(resolveHorizontalSwipeDirection({
      translationX: 60,
      translationY: 0,
      velocityX: -2000,
      velocityY: 0,
    })).toBe('right');
    expect(resolveHorizontalSwipeDirection({
      translationX: 60,
      translationY: 59,
      velocityX: 0,
      velocityY: 2000,
    })).toBe('right');
  });
});
