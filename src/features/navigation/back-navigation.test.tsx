import { act, renderHook } from '@testing-library/react-native';
import type { ImperativeRouter } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { BackHandler } from 'react-native';

import { useBackDismissal } from '@/hooks/use-back-dismissal';
import {
  resolveNavigationBackAction,
  useNavigationBackHandler,
  useSettingsBackNavigation,
} from './back-navigation';

jest.mock('expo-router/react-navigation', () => ({
  usePreventRemove: jest.fn(),
}));

type HardwareBackHandler = Parameters<typeof BackHandler.addEventListener>[1];

const hardwareBackEvent = { type: 'hardwareBackPress', timeStamp: 0 };

function createRouter(): ImperativeRouter {
  return {
    back: jest.fn(),
    canDismiss: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
    dismiss: jest.fn(),
    dismissAll: jest.fn(),
    dismissTo: jest.fn(),
    navigate: jest.fn(),
    prefetch: jest.fn(),
    push: jest.fn(),
    reload: jest.fn(),
    replace: jest.fn(),
    setParams: jest.fn(),
  };
}

describe('back navigation', () => {
  let handlers: HardwareBackHandler[];
  let removeListener: jest.Mock;
  let exitApp: jest.Mock;

  beforeEach(() => {
    handlers = [];
    removeListener = jest.fn();
    exitApp = jest.fn();
    jest.mocked(usePreventRemove).mockClear();
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_eventName, handler) => {
      handlers.push(handler);
      return {
        remove: () => {
          handlers = handlers.filter((candidate) => candidate !== handler);
          removeListener();
        },
      };
    });
    jest.spyOn(BackHandler, 'exitApp').mockImplementation(exitApp);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function pressHardwareBack(): boolean {
    for (let index = handlers.length - 1; index >= 0; index -= 1) {
      const handler = handlers[index];
      if (handler?.(hardwareBackEvent)) return true;
    }
    return false;
  }

  it.each([
    ['/settings', 'return-dashboard'],
    ['/settings/network', 'return-dashboard'],
    ['/settings/account', 'return-dashboard'],
    ['/dashboard', 'exit-app'],
    ['/dashboard/overview', 'exit-app'],
    ['/dashboard/operators', 'exit-app'],
    ['/login', 'delegate'],
    ['/settings-profile', 'delegate'],
    ['/dashboard-preview', 'delegate'],
  ] as const)('resolves %s to %s', (pathname, expectedAction) => {
    expect(resolveNavigationBackAction(pathname)).toBe(expectedAction);
  });

  it('returns from settings to Dashboard and exits from Dashboard', async () => {
    const onReturnToDashboard = jest.fn();
    const { rerender, unmount } = await renderHook(
      ({ pathname }: { pathname: string }) => {
        useNavigationBackHandler(pathname, onReturnToDashboard);
      },
      { initialProps: { pathname: '/settings/account' } },
    );

    expect(pressHardwareBack()).toBe(true);
    expect(onReturnToDashboard).toHaveBeenCalledTimes(1);
    expect(exitApp).not.toHaveBeenCalled();

    await rerender({ pathname: '/dashboard/activity' });
    expect(pressHardwareBack()).toBe(true);
    expect(exitApp).toHaveBeenCalledTimes(1);

    await unmount();
  });

  it('dismisses an open overlay before applying the page action', async () => {
    const onDismiss = jest.fn();
    const onReturnToDashboard = jest.fn();
    const { rerender, unmount } = await renderHook(
      ({ open }: { open: boolean }) => {
        useNavigationBackHandler('/settings/network', onReturnToDashboard);
        useBackDismissal(open, onDismiss);
      },
      { initialProps: { open: true } },
    );

    expect(pressHardwareBack()).toBe(true);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onReturnToDashboard).not.toHaveBeenCalled();

    await rerender({ open: false });
    expect(pressHardwareBack()).toBe(true);
    expect(onReturnToDashboard).toHaveBeenCalledTimes(1);

    await unmount();
  });

  it('registers open overlays with native and browser stack removal prevention', async () => {
    const onDismiss = jest.fn();
    const { rerender, unmount } = await renderHook(
      ({ open }: { open: boolean }) => useBackDismissal(open, onDismiss),
      { initialProps: { open: true } },
    );

    expect(usePreventRemove).toHaveBeenLastCalledWith(true, expect.any(Function));
    const preventRemoveCallback = jest.mocked(usePreventRemove).mock.calls.at(-1)?.[1];
    preventRemoveCallback?.({ data: { action: { type: 'GO_BACK' } } });
    expect(onDismiss).toHaveBeenCalledTimes(1);

    await rerender({ open: false });
    expect(usePreventRemove).toHaveBeenLastCalledWith(false, expect.any(Function));

    await unmount();
  });

  it('pushes Settings directly when Dashboard Overview is active', async () => {
    const router = createRouter();
    const { result, unmount } = await renderHook(() => useSettingsBackNavigation({
      pathname: '/dashboard/overview',
      router,
      settingsRoute: '/settings/network',
    }));

    await act(() => result.current.enterSettings('/settings/account'));

    expect(router.push).toHaveBeenCalledWith('/settings/account');
    expect(router.replace).not.toHaveBeenCalled();
    await unmount();
  });

  it('anchors Settings below Dashboard Overview when opened from another Dashboard page', async () => {
    const router = createRouter();
    const { result, rerender, unmount } = await renderHook(
      ({ pathname }: { pathname: string }) => useSettingsBackNavigation({
        pathname,
        router,
        settingsRoute: '/settings/network',
      }),
      { initialProps: { pathname: '/dashboard/operators' } },
    );

    await act(() => result.current.enterSettings('/settings/account'));
    expect(router.replace).toHaveBeenCalledWith('/dashboard/overview');
    expect(router.push).not.toHaveBeenCalled();

    await rerender({ pathname: '/dashboard/overview' });
    expect(router.push).toHaveBeenCalledWith('/settings/account');

    await unmount();
  });

  it('builds the same history anchor for a direct Settings entry', async () => {
    const router = createRouter();
    jest.mocked(router.canDismiss).mockReturnValue(false);
    const { rerender, unmount } = await renderHook(
      ({ pathname }: { pathname: string }) => useSettingsBackNavigation({
        pathname,
        router,
        settingsRoute: '/settings/acknowledgements',
      }),
      { initialProps: { pathname: '/settings/acknowledgements' } },
    );

    expect(router.replace).toHaveBeenCalledWith('/dashboard/overview');
    await rerender({ pathname: '/dashboard/overview' });
    expect(router.push).toHaveBeenCalledWith('/settings/acknowledgements');

    await unmount();
  });

  it('does not rebuild an existing Settings stack and returns with dismissTo', async () => {
    const router = createRouter();
    const { result, unmount } = await renderHook(() => useSettingsBackNavigation({
      pathname: '/settings/network',
      router,
      settingsRoute: '/settings/network',
    }));

    expect(router.replace).not.toHaveBeenCalled();
    await act(() => result.current.returnToDashboard());
    expect(router.dismissTo).toHaveBeenCalledWith('/dashboard/overview');

    await unmount();
  });

  it('removes the hardware listener when navigation unmounts', async () => {
    const { unmount } = await renderHook(() => useNavigationBackHandler('/login', jest.fn()));

    expect(handlers).toHaveLength(1);
    await unmount();
    expect(handlers).toHaveLength(0);
    expect(removeListener).toHaveBeenCalledTimes(1);
  });
});
