import type { PropsWithChildren } from 'react';
import { render } from '@testing-library/react-native';

import type { LayoutSize } from '@/schemas/layout-size';
import { ROUTES } from '@/constants/routes';

const mockSlot = jest.fn(() => null);
const mockStack = jest.fn(() => null);
const mockRedirect = jest.fn(() => null);
const mockSafeAreaView = jest.fn(({ children }: PropsWithChildren<{
  edges?: readonly string[];
  style?: object;
}>) => children);
const mockAppProvider = jest.fn(({ children }: PropsWithChildren) => children);
const mockSessionShell = jest.fn(({ children }: PropsWithChildren) => children);
const mockNavigationLayout = jest.fn(({ children }: PropsWithChildren) => children);
const mockUseSessionQueryCacheReset = jest.fn();
const mockUseArkHostSync = jest.fn();
const mockUsePathname = jest.fn(() => '/dashboard/overview');
const mockRouterReplace = jest.fn();
const mockUseRouter = jest.fn(() => ({ replace: mockRouterReplace }));
const mockResetBackdropTint = jest.fn();
const mockLogout = jest.fn();
const mockUseLayoutSize = jest.fn((): LayoutSize => 'small');

let mockSession: object | null = { principal: 'doctor' };

jest.mock('expo-router', () => ({
  Redirect: mockRedirect,
  Slot: mockSlot,
  Stack: mockStack,
  usePathname: mockUsePathname,
  useRouter: mockUseRouter,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: mockSafeAreaView,
}));

jest.mock('@/features/dashboard', () => ({
  useArkHostSync: mockUseArkHostSync,
  useSessionQueryCacheReset: mockUseSessionQueryCacheReset,
}));

jest.mock('@/features/navigation', () => ({
  NavigationLayout: mockNavigationLayout,
}));

jest.mock('@/features/session', () => ({
  SessionShell: mockSessionShell,
  useSessionBackdrop: () => ({ resetBackdropTint: mockResetBackdropTint }),
}));

jest.mock('@/providers', () => ({
  AppProvider: mockAppProvider,
}));

jest.mock('@/providers/layout-size-provider', () => ({
  useLayoutSize: mockUseLayoutSize,
}));

jest.mock('@/store', () => ({
  useAppStore: (selector: (state: {
    auth: { session: object | null };
    logout: () => void;
  }) => unknown) => selector({
    auth: { session: mockSession },
    logout: mockLogout,
  }),
}));

const RootLayout = jest.requireActual<typeof import('../src/app/_layout')>('../src/app/_layout').default;
const AppLayout = jest.requireActual<typeof import('../src/app/(app)/_layout')>('../src/app/(app)/_layout').default;
const SettingsLayout = jest.requireActual<typeof import('../src/app/(app)/settings/_layout')>('../src/app/(app)/settings/_layout').default;

function readLastCallProps<T extends object>(mock: jest.Mock): T {
  const props = mock.mock.calls.at(-1)?.[0];
  if (typeof props !== 'object' || props === null) {
    throw new Error('Expected a component props object.');
  }
  return props as T;
}

describe('route layouts', () => {
  beforeEach(() => {
    mockSlot.mockClear();
    mockStack.mockClear();
    mockRedirect.mockClear();
    mockSafeAreaView.mockClear();
    mockNavigationLayout.mockClear();
    mockUseSessionQueryCacheReset.mockClear();
    mockUseArkHostSync.mockClear();
    mockRouterReplace.mockClear();
    mockResetBackdropTint.mockClear();
    mockLogout.mockClear();
    mockUseLayoutSize.mockReset();
    mockUseLayoutSize.mockReturnValue('small');
    mockUsePathname.mockReset();
    mockUsePathname.mockReturnValue('/dashboard/overview');
    mockSession = { principal: 'doctor' };
  });

  it('renders the Root child through Slot without a Stack', async () => {
    await render(<RootLayout />);

    expect(mockSlot).toHaveBeenCalledTimes(1);
    expect(mockStack).not.toHaveBeenCalled();
  });

  it('renders Settings through Slot and keeps the responsive safe-area edges', async () => {
    await render(<SettingsLayout />);

    expect(mockSlot).toHaveBeenCalledTimes(1);
    expect(readLastCallProps<{ edges?: readonly string[] }>(mockSafeAreaView).edges).toEqual(['bottom']);

    mockUseLayoutSize.mockReturnValue('large');
    mockSafeAreaView.mockClear();
    mockSlot.mockClear();
    await render(<SettingsLayout />);

    expect(mockSlot).toHaveBeenCalledTimes(1);
    expect(readLastCallProps<{ edges?: readonly string[] }>(mockSafeAreaView).edges).toEqual([]);
  });

  it('uses one static native App Stack configuration at every layout size', async () => {
    await render(<AppLayout />);

    const smallScreenOptions = readLastCallProps<{ screenOptions: object }>(mockStack).screenOptions;
    expect(smallScreenOptions).toEqual({
      animation: 'none',
      contentStyle: { backgroundColor: 'transparent' },
      gestureEnabled: false,
      headerShown: false,
    });

    mockUseLayoutSize.mockReturnValue('large');
    mockStack.mockClear();
    await render(<AppLayout />);

    expect(readLastCallProps<{ screenOptions: object }>(mockStack).screenOptions).toEqual(smallScreenOptions);
  });

  it('redirects unauthenticated App routes to Login with the current route', async () => {
    mockSession = null;
    mockUsePathname.mockReturnValue('/settings/account');

    await render(<AppLayout />);

    expect(mockRedirect).toHaveBeenCalledWith({
      href: { pathname: ROUTES.login, params: { returnTo: '/settings/account' } },
    }, undefined);
    expect(mockStack).not.toHaveBeenCalled();
  });

  it('keeps logout reset, store, and route replacement behavior', async () => {
    await render(<AppLayout />);

    const navigationProps = readLastCallProps<{ onLogout: () => void }>(mockNavigationLayout);
    navigationProps.onLogout();

    expect(mockResetBackdropTint).toHaveBeenCalledTimes(1);
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockRouterReplace).toHaveBeenCalledWith(ROUTES.login);
  });
});
