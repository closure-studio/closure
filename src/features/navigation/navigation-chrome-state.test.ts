import { act, renderHook } from '@testing-library/react-native';

import { PAGE_TRANSITION_TIMING } from '@/constants/page-transition';
import {
  resolveNavigationChromeVisibility,
  useSettledNavigationScope,
} from './navigation-chrome-state';
import type { NavigationScope } from './navigation-config';

describe('navigation chrome state', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows only the chrome owned by the settled compact scope', () => {
    expect(resolveNavigationChromeVisibility({
      isCompact: true,
      scope: 'dashboard',
      settledScope: 'dashboard',
    })).toEqual({
      isDashboardChromeVisible: true,
      isNavigationHeaderVisible: true,
      isScopeContentVisible: true,
      isSettingsChromeVisible: false,
    });

    expect(resolveNavigationChromeVisibility({
      isCompact: true,
      scope: 'settings',
      settledScope: 'settings',
    })).toEqual({
      isDashboardChromeVisible: false,
      isNavigationHeaderVisible: false,
      isScopeContentVisible: true,
      isSettingsChromeVisible: true,
    });
  });

  it('keeps compact chrome hidden while scopes exchange and preserves the desktop header', () => {
    expect(resolveNavigationChromeVisibility({
      isCompact: true,
      scope: 'settings',
      settledScope: 'dashboard',
    })).toEqual({
      isDashboardChromeVisible: false,
      isNavigationHeaderVisible: false,
      isScopeContentVisible: false,
      isSettingsChromeVisible: false,
    });

    expect(resolveNavigationChromeVisibility({
      isCompact: false,
      scope: 'settings',
      settledScope: 'dashboard',
    }).isNavigationHeaderVisible).toBe(true);
  });

  it('settles the next scope after the chrome exit phase and cancels stale swaps', async () => {
    jest.useFakeTimers();
    const { result, rerender } = await renderHook(
      ({ reducedMotion, scope }: { reducedMotion: boolean; scope: NavigationScope }) => (
        useSettledNavigationScope(scope, reducedMotion)
      ),
      { initialProps: { reducedMotion: false, scope: 'dashboard' } },
    );

    await rerender({ reducedMotion: false, scope: 'settings' });
    expect(result.current).toBe('dashboard');

    await act(() => jest.advanceTimersByTime(PAGE_TRANSITION_TIMING.phaseMs - 1));
    expect(result.current).toBe('dashboard');

    await rerender({ reducedMotion: false, scope: 'dashboard' });
    await act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe('dashboard');

    await rerender({ reducedMotion: false, scope: 'settings' });
    await act(() => jest.advanceTimersByTime(PAGE_TRANSITION_TIMING.phaseMs));
    expect(result.current).toBe('settings');
  });

  it('switches scopes immediately when reduced motion is enabled', async () => {
    const { result, rerender } = await renderHook(
      ({ reducedMotion, scope }: { reducedMotion: boolean; scope: NavigationScope }) => (
        useSettledNavigationScope(scope, reducedMotion)
      ),
      { initialProps: { reducedMotion: true, scope: 'dashboard' } },
    );

    await rerender({ reducedMotion: true, scope: 'settings' });
    expect(result.current).toBe('settings');
  });
});
