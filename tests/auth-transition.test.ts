import {
  getRouteScreenOptions,
} from '@/features/session';

describe('route transition', () => {
  it('disables route animation when reduced motion is enabled', () => {
    expect(getRouteScreenOptions(true)).toMatchObject({ animation: 'none' });
  });

  it('uses the shared fade-scale transition for navigation and replacement', () => {
    expect(getRouteScreenOptions(false)).toMatchObject({
      animation: 'default',
      animationTypeForReplace: 'push',
      cardStyleInterpolator: expect.any(Function),
      transitionSpec: {
        open: { config: { duration: 1_000 } },
        close: { config: { duration: 1_000 } },
      },
    });
  });
});
