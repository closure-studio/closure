import type { PropsWithChildren } from 'react';
import { render } from '@testing-library/react-native';

import { ROUTES } from '@/constants/routes';

type DashboardAccountProviderProps = PropsWithChildren<{
  onSelectGameAccount: (gameAccountId: string) => void;
}>;

const mockSlot = jest.fn(() => null);
const mockRedirect = jest.fn(() => null);
const mockAppProvider = jest.fn(({ children }: PropsWithChildren) => children);
const mockDashboardAccountProvider = jest.fn(({
  children,
}: DashboardAccountProviderProps) => children);
const mockDashboardFrame = jest.fn(({ children }: PropsWithChildren) => children);
const mockRouterReplace = jest.fn();
const mockRouterSetParams = jest.fn();
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
  routeGameAccountId: 'G1' as string | null,
  selectedGameAccount: { account: 'G1' } as { account: string } | null,
  selectGameAccount: mockSelectGameAccount,
};

jest.mock('expo-router', () => ({
  Redirect: mockRedirect,
  Slot: mockSlot,
  usePathname: mockUsePathname,
  useRouter: () => ({
    replace: mockRouterReplace,
    setParams: mockRouterSetParams,
  }),
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
  dashboardDefaultPage: { id: 'overview' },
  dashboardPageHref: (pageId: string, gameAccountId: string) => ({
    pathname: `/dashboard/[gameAccountId]/${pageId}`,
    params: { gameAccountId },
  }),
  getDashboardPageId: (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);
    return segments.length === 3 && segments[0] === 'dashboard'
      ? segments[2]
      : null;
  },
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
      routeGameAccountId: 'G1',
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

  it('preserves the active Dashboard page when the account route changes', async () => {
    mockUsePathname.mockReturnValue('/dashboard/G1/operators');
    await render(<DashboardLayout />);
    const providerCall = mockDashboardAccountProvider.mock.calls.at(-1);
    if (!providerCall) throw new Error('Expected DashboardAccountProvider props.');

    providerCall[0].onSelectGameAccount('G2');

    expect(mockRouterSetParams).toHaveBeenCalledTimes(1);
    expect(mockRouterSetParams).toHaveBeenCalledWith({ gameAccountId: 'G2' });
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it('replaces the Dashboard index with the default account route once', async () => {
    mockUsePathname.mockReturnValue(ROUTES.dashboard);
    await render(<DashboardLayout />);
    const providerCall = mockDashboardAccountProvider.mock.calls.at(-1);
    if (!providerCall) throw new Error('Expected DashboardAccountProvider props.');

    providerCall[0].onSelectGameAccount('G1');

    expect(mockRouterReplace).toHaveBeenCalledWith({
      pathname: '/dashboard/[gameAccountId]/overview',
      params: { gameAccountId: 'G1' },
    });
    expect(mockRouterSetParams).not.toHaveBeenCalled();
  });

  it('does not select the fallback account during a dynamic route transition', async () => {
    mockDashboardAccount = {
      ...mockDashboardAccount,
      routeGameAccountId: null,
      selectedGameAccount: null,
    };

    await render(<DashboardLayout />);

    expect(mockSelectGameAccount).not.toHaveBeenCalled();
  });

  it('selects the fallback account for the Dashboard index', async () => {
    mockUsePathname.mockReturnValue(ROUTES.dashboard);
    mockDashboardAccount = {
      ...mockDashboardAccount,
      routeGameAccountId: null,
      selectedGameAccount: null,
    };

    await render(<DashboardLayout />);

    expect(mockSelectGameAccount).toHaveBeenCalledTimes(1);
    expect(mockSelectGameAccount).toHaveBeenCalledWith('G1');
  });

  it('selects the fallback account for a stable unknown account route', async () => {
    mockUsePathname.mockReturnValue('/dashboard/G9/operators');
    mockDashboardAccount = {
      ...mockDashboardAccount,
      routeGameAccountId: 'G9',
      selectedGameAccount: null,
    };

    await render(<DashboardLayout />);

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
