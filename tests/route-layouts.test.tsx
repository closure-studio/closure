import type { PropsWithChildren } from 'react';
import { render } from '@testing-library/react-native';

import { ROUTES } from '@/constants/routes';

const mockSlot = jest.fn(() => null);
const mockRedirect = jest.fn(() => null);
const mockAppProvider = jest.fn(({ children }: PropsWithChildren) => children);
const mockDashboardAccountProvider = jest.fn(({ children }: PropsWithChildren) => children);
const mockDashboardFrame = jest.fn(({ children }: PropsWithChildren) => children);
const mockSelectGameAccount = jest.fn();
const mockSessionShell = jest.fn(({ children }: PropsWithChildren) => children);
const mockAppScopeNavigator = jest.fn(() => null);
const mockUseSessionQueryCacheReset = jest.fn();
const mockUseArkHostSync = jest.fn();
const mockUsePathname = jest.fn(() => '/dashboard/G1/overview');

let mockSession: object | null = { principal: 'doctor' };
let mockDashboardAccount = {
  gameAccountsQuery: {
    data: [{ account: 'G1' }],
    isError: false,
    isPending: false,
  },
  selectedGameAccount: { account: 'G1' } as { account: string } | null,
  selectGameAccount: mockSelectGameAccount,
};

jest.mock('expo-router', () => ({
  Redirect: mockRedirect,
  Slot: mockSlot,
  usePathname: mockUsePathname,
}));

jest.mock('@/features/dashboard', () => ({
  DashboardAccountProvider: mockDashboardAccountProvider,
  useArkHostSync: mockUseArkHostSync,
  useDashboardAccount: () => mockDashboardAccount,
  useSessionQueryCacheReset: mockUseSessionQueryCacheReset,
}));

jest.mock('@/features/navigation', () => ({
  AppScopeNavigator: mockAppScopeNavigator,
  DashboardFrame: mockDashboardFrame,
  DashboardSmallScreenTabBar: jest.fn(() => null),
  dashboardDefaultPage: { id: 'overview' },
  dashboardPagesList: [{ id: 'overview' }],
  dashboardPageHref: (pageId: string, gameAccountId: string) => ({
    pathname: `/dashboard/[gameAccountId]/${pageId}`,
    params: { gameAccountId },
  }),
}));

jest.mock('tamagui', () => ({
  ...jest.requireActual<typeof import('tamagui')>('tamagui'),
  useMedia: () => ({ large: false }),
}));

jest.mock('@/features/session', () => ({
  SessionShell: mockSessionShell,
}));

jest.mock('@/providers', () => ({
  AppProvider: mockAppProvider,
}));

jest.mock('@/store', () => ({
  useAppStore: (selector: (state: { auth: { session: object | null } }) => unknown) => selector({
    auth: { session: mockSession },
  }),
}));

const RootLayout = jest.requireActual<typeof import('../src/app/_layout')>('../src/app/_layout').default;
const AppLayout = jest.requireActual<typeof import('../src/app/(app)/_layout')>('../src/app/(app)/_layout').default;
const DashboardLayout = jest.requireActual<typeof import('../src/app/(app)/dashboard/_layout')>('../src/app/(app)/dashboard/_layout').default;
const DashboardIndexRoute = jest.requireActual<typeof import('../src/app/(app)/dashboard/index')>('../src/app/(app)/dashboard/index').default;
const DashboardAccountLayout = jest.requireActual<typeof import('../src/app/(app)/dashboard/[gameAccountId]/_layout')>('../src/app/(app)/dashboard/[gameAccountId]/_layout').default;
const SettingsLayout = jest.requireActual<typeof import('../src/app/(app)/settings/_layout')>('../src/app/(app)/settings/_layout').default;

describe('route layouts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/dashboard/G1/overview');
    mockSession = { principal: 'doctor' };
    mockDashboardAccount = {
      gameAccountsQuery: {
        data: [{ account: 'G1' }],
        isError: false,
        isPending: false,
      },
      selectedGameAccount: { account: 'G1' },
      selectGameAccount: mockSelectGameAccount,
    };
  });

  it('renders the Root child through Slot without a Stack', async () => {
    await render(<RootLayout />);

    expect(mockSlot).toHaveBeenCalledTimes(1);
  });

  it('owns Dashboard and Settings with the platform scope navigator', async () => {
    await render(<AppLayout />);

    expect(mockAppScopeNavigator).toHaveBeenCalledTimes(1);
    expect(mockDashboardAccountProvider).not.toHaveBeenCalled();
  });

  it('keeps the Dashboard frame in the static layout above account routes', async () => {
    await render(<DashboardLayout />);

    expect(mockDashboardAccountProvider).toHaveBeenCalledTimes(1);
    expect(mockDashboardFrame).toHaveBeenCalledTimes(1);
    expect(mockSlot).toHaveBeenCalledTimes(1);
  });

  it('keeps the Dashboard route mounted while an account route is unresolved', async () => {
    mockDashboardAccount = {
      ...mockDashboardAccount,
      selectedGameAccount: null,
    };

    await render(<DashboardLayout />);

    expect(mockDashboardFrame).toHaveBeenCalledTimes(1);
    expect(mockSlot).toHaveBeenCalledTimes(1);
  });

  it('redirects the Dashboard index to the first account default page', async () => {
    await render(<DashboardIndexRoute />);

    expect(mockRedirect).toHaveBeenCalledWith({
      href: {
        pathname: '/dashboard/[gameAccountId]/overview',
        params: { gameAccountId: 'G1' },
      },
    }, undefined);
  });

  it('selects the fallback account from an invalid account route', async () => {
    mockDashboardAccount = {
      ...mockDashboardAccount,
      selectedGameAccount: null,
    };

    await render(<DashboardAccountLayout />);

    expect(mockSelectGameAccount).toHaveBeenCalledTimes(1);
    expect(mockSelectGameAccount).toHaveBeenCalledWith('G1');
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
