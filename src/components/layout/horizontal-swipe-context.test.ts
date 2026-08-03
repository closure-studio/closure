import {
  resolveHorizontalSwipeDirection,
  resolveHorizontalSwipeEnabled,
} from './horizontal-swipe-context';

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

describe('resolveHorizontalSwipeEnabled', () => {
  it.each([
    { expected: true, scopeEnabled: true, surfaceEnabled: true },
    { expected: false, scopeEnabled: true, surfaceEnabled: false },
    { expected: false, scopeEnabled: false, surfaceEnabled: true },
    { expected: false, scopeEnabled: undefined, surfaceEnabled: true },
  ])('returns $expected for scope=$scopeEnabled and surface=$surfaceEnabled', (input) => {
    expect(resolveHorizontalSwipeEnabled(input)).toBe(input.expected);
  });
});
