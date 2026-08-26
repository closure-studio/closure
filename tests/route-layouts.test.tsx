import type { PropsWithChildren } from 'react';
import { render } from '@testing-library/react-native';

import { ROUTES } from '@/constants/routes';

const mockSlot = jest.fn(() => null);
const mockRedirect = jest.fn(() => null);
const mockAppProvider = jest.fn(({ children }: PropsWithChildren) => children);
const mockDashboardRouteProvider = jest.fn(({ children }: PropsWithChildren) => children);
const mockSessionShell = jest.fn(({ children }: PropsWithChildren) => children);
const mockAppScopeNavigator = jest.fn(() => null);
const mockUseSessionQueryCacheReset = jest.fn();
const mockUseArkHostSync = jest.fn();
const mockUsePathname = jest.fn(() => '/dashboard/G1/overview');

let mockSession: object | null = { principal: 'doctor' };

jest.mock('expo-router', () => ({
  Redirect: mockRedirect,
  Slot: mockSlot,
  usePathname: mockUsePathname,
}));

jest.mock('@/features/dashboard', () => ({
  DashboardRouteProvider: mockDashboardRouteProvider,
  useArkHostSync: mockUseArkHostSync,
  useSessionQueryCacheReset: mockUseSessionQueryCacheReset,
}));

jest.mock('@/features/navigation', () => ({
  AppScopeNavigator: mockAppScopeNavigator,
}));

jest.mock('@/features/session', () => ({
  SessionShell: mockSessionShell,
}));

jest.mock('@/providers', () => ({
  AppProvider: mockAppProvider,
}));

jest.mock('@/providers/layout-size-provider', () => ({
  useLayoutSize: () => 'small',
}));

jest.mock('@/store', () => ({
  useAppStore: (selector: (state: { auth: { session: object | null } }) => unknown) => selector({
    auth: { session: mockSession },
  }),
}));

const RootLayout = jest.requireActual<typeof import('../src/app/_layout')>('../src/app/_layout').default;
const AppLayout = jest.requireActual<typeof import('../src/app/(app)/_layout')>('../src/app/(app)/_layout').default;
const SettingsLayout = jest.requireActual<typeof import('../src/app/(app)/settings/_layout')>('../src/app/(app)/settings/_layout').default;

describe('route layouts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/dashboard/G1/overview');
    mockSession = { principal: 'doctor' };
  });

  it('renders the Root child through Slot without a Stack', async () => {
    await render(<RootLayout />);

    expect(mockSlot).toHaveBeenCalledTimes(1);
  });

  it('owns Dashboard and Settings with the platform scope navigator', async () => {
    await render(<AppLayout />);

    expect(mockAppScopeNavigator).toHaveBeenCalledTimes(1);
    expect(mockDashboardRouteProvider).not.toHaveBeenCalled();
  });

  it('redirects unauthenticated App routes to Login with the current route', async () => {
    mockSession = null;
    mockUsePathname.mockReturnValue('/settings/account');

    await render(<AppLayout />);

    expect(mockRedirect).toHaveBeenCalledWith({
      href: { pathname: ROUTES.login, params: { returnTo: '/settings/account' } },
    }, undefined);
    expect(mockAppScopeNavigator).not.toHaveBeenCalled();
  });

  it('keeps the Settings parent route as a stable slot', async () => {
    await render(<SettingsLayout />);

    expect(mockSlot).toHaveBeenCalledTimes(1);
  });
});
