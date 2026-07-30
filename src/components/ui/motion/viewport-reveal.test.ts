import { getViewportRevealAction, getViewportVisibilityState } from './viewport-reveal';

describe('getViewportVisibilityState', () => {
  it('waits for valid item and viewport dimensions', () => {
    expect(getViewportVisibilityState({ amount: 0.35, itemHeight: 0, itemTop: 0, viewportHeight: 600, viewportTop: 0 })).toBe('unavailable');
    expect(getViewportVisibilityState({ amount: 0.35, itemHeight: 200, itemTop: 0, viewportHeight: 0, viewportTop: 0 })).toBe('unavailable');
  });

  it('treats an item outside either viewport edge as hidden', () => {
    expect(getViewportVisibilityState({ amount: 0.35, itemHeight: 200, itemTop: -201, viewportHeight: 600, viewportTop: 0 })).toBe('hidden');
    expect(getViewportVisibilityState({ amount: 0.35, itemHeight: 200, itemTop: 601, viewportHeight: 600, viewportTop: 0 })).toBe('hidden');
  });

  it('becomes visible exactly at the configured item threshold', () => {
    expect(getViewportVisibilityState({ amount: 0.35, itemHeight: 200, itemTop: 530, viewportHeight: 600, viewportTop: 0 })).toBe('visible');
    expect(getViewportVisibilityState({ amount: 0.35, itemHeight: 200, itemTop: 531, viewportHeight: 600, viewportTop: 0 })).toBe('hidden');
  });

  it('uses screen coordinates rather than assuming a zero-based viewport', () => {
    expect(getViewportVisibilityState({ amount: 0.5, itemHeight: 200, itemTop: 700, viewportHeight: 500, viewportTop: 300 })).toBe('visible');
  });
});

describe('getViewportRevealAction', () => {
  it('waits while measurements are unavailable', () => {
    expect(getViewportRevealAction({ hasCompletedInitialCheck: false, hasRevealed: false, visibility: 'unavailable' })).toBe('none');
  });

  it('shows initially visible content without an animation', () => {
    expect(getViewportRevealAction({ hasCompletedInitialCheck: false, hasRevealed: false, visibility: 'visible' })).toBe('show-immediately');
  });

  it('records initially hidden content before waiting for viewport entry', () => {
    expect(getViewportRevealAction({ hasCompletedInitialCheck: false, hasRevealed: false, visibility: 'hidden' })).toBe('mark-initial-hidden');
    expect(getViewportRevealAction({ hasCompletedInitialCheck: true, hasRevealed: false, visibility: 'visible' })).toBe('animate');
  });

  it('never triggers again after the item has revealed', () => {
    expect(getViewportRevealAction({ hasCompletedInitialCheck: true, hasRevealed: true, visibility: 'hidden' })).toBe('none');
    expect(getViewportRevealAction({ hasCompletedInitialCheck: true, hasRevealed: true, visibility: 'visible' })).toBe('none');
  });
});
