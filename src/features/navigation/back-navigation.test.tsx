import { renderHook } from '@testing-library/react-native';
import { usePreventRemove } from 'expo-router/react-navigation';
import { BackHandler } from 'react-native';

import { useBackDismissal } from '@/hooks/use-back-dismissal';
import {
  resolveNavigationBackAction,
  useNavigationBackHandler,
} from './back-navigation';

jest.mock('expo-router/react-navigation', () => ({
  usePreventRemove: jest.fn(),
}));

type HardwareBackHandler = Parameters<typeof BackHandler.addEventListener>[1];

const hardwareBackEvent = { type: 'hardwareBackPress', timeStamp: 0 };

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
    ['/dashboard/G1/overview', 'exit-app'],
    ['/dashboard/G1/operators', 'exit-app'],
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

    await rerender({ pathname: '/dashboard/G1/activity' });
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

  it('removes the hardware listener when navigation unmounts', async () => {
    const { unmount } = await renderHook(() => useNavigationBackHandler('/login', jest.fn()));

    expect(handlers).toHaveLength(1);
    await unmount();
    expect(handlers).toHaveLength(0);
    expect(removeListener).toHaveBeenCalledTimes(1);
  });
});
