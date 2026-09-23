import type { PropsWithChildren } from 'react';
import { render } from '@testing-library/react-native';

import { ROUTES } from '@/constants/routes';

const mockSlot = jest.fn(() => null);
const mockRedirect = jest.fn(() => null);
const mockAppProvider = jest.fn(({ children }: PropsWithChildren) => children);
const mockDashboardAccountProvider = jest.fn(({ children }: PropsWithChildren) => children);
const mockDashboardFrame = jest.fn(({ children }: PropsWithChildren) => children);
const mockDashboardScope = jest.fn(({ children }: PropsWithChildren) => children);
const mockDashboardTabs = jest.fn(({ children }: PropsWithChildren) => children);
const mockDashboardTabScreen = jest.fn(() => null);
const mockSelectGameAccount = jest.fn();
const mockSessionShell = jest.fn(({ children }: PropsWithChildren) => children);
const mockUseSessionLifetime = jest.fn();
const mockAppScopeNavigator = jest.fn(() => null);
const mockUseSessionQueryCacheReset = jest.fn();
const mockUseArkHostSync = jest.fn();
const mockUsePathname = jest.fn(() => '/dashboard/overview');
const mockRouterReplace = jest.fn();
const mockUseGameAccountCreation = jest.fn((_options: {
  onGameAccountSelected: () => void;
}) => ({
  canCreateGame: false,
  dialog: {
    error: null,
    isPending: false,
    onClearError: jest.fn(),
    onOpenChange: jest.fn(),
    onSubmit: jest.fn(),
    open: false,
  },
  openDialog: jest.fn(),
}));

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

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('expo-router', () => ({
  Redirect: mockRedirect,
  Slot: mockSlot,
  usePathname: mockUsePathname,
  useRouter: () => ({ replace: mockRouterReplace }),
}));

jest.mock('expo-router/tabs', () => ({
  Tabs: Object.assign(mockDashboardTabs, { Screen: mockDashboardTabScreen }),
}));

jest.mock('@/features/dashboard', () => ({
  EmptyGameAccountState: jest.fn(() => null),
  GameAccountCreationDialog: jest.fn(() => null),
  GameVerification: jest.fn(() => null),
  DashboardAccountProvider: mockDashboardAccountProvider,
  useArkHostSync: mockUseArkHostSync,
  useDashboardAccount: () => mockDashboardAccount,
  useGameAccountCreation: mockUseGameAccountCreation,
  useSessionQueryCacheReset: mockUseSessionQueryCacheReset,
}));

jest.mock('@/features/navigation', () => ({
  AppScopeNavigator: mockAppScopeNavigator,
  DashboardFrame: mockDashboardFrame,
  DashboardScope: mockDashboardScope,
  DashboardSmallScreenTabBar: jest.fn(() => null),
  dashboardDefaultPageId: 'overview',
  dashboardPages: [{ id: 'overview' }],
  dashboardPageHref: (pageId: string) => `/dashboard/${pageId}`,
}));

jest.mock('tamagui', () => ({
  ...jest.requireActual<typeof import('tamagui')>('tamagui'),
  useMedia: () => ({ large: false }),
}));

jest.mock('@/features/session', () => ({
  SessionShell: mockSessionShell,
  useSessionLifetime: mockUseSessionLifetime,
}));

jest.mock('@/providers', () => ({
  AppProvider: mockAppProvider,
}));

jest.mock('@/features/verification', () => ({ VerificationHost: jest.fn(() => null) }));

jest.mock('@/store', () => ({
  useAppStore: (selector: (state: { auth: { session: object | null } }) => unknown) => selector({
    auth: { session: mockSession },
  }),
}));

const RootLayout = jest.requireActual<typeof import('../src/app/_layout')>('../src/app/_layout').default;
const AppLayout = jest.requireActual<typeof import('../src/app/(app)/_layout')>('../src/app/(app)/_layout').default;
const DashboardLayout = jest.requireActual<typeof import('../src/app/(app)/dashboard/_layout')>('../src/app/(app)/dashboard/_layout').default;
const DashboardIndexRoute = jest.requireActual<typeof import('../src/app/(app)/dashboard/index')>('../src/app/(app)/dashboard/index').default;
const SettingsLayout = jest.requireActual<typeof import('../src/app/(app)/settings/_layout')>('../src/app/(app)/settings/_layout').default;

describe('route layouts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/dashboard/overview');
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

  it('keeps the Dashboard frame above the static page tabs', async () => {
    await render(<DashboardLayout />);

    expect(mockDashboardAccountProvider).toHaveBeenCalledTimes(1);
    expect(mockDashboardScope).toHaveBeenCalledTimes(1);
    expect(mockDashboardFrame).toHaveBeenCalledTimes(1);
    expect(mockDashboardTabs).toHaveBeenCalledTimes(1);
    expect(mockSlot).not.toHaveBeenCalled();
    expect(mockDashboardTabs.mock.calls[0]?.[0]).toEqual(expect.objectContaining({
      screenOptions: expect.objectContaining({
        animation: 'shift',
        headerShown: false,
      }),
    }));
  });

  it('returns to Overview after the creation workflow selects its new account', async () => {
    await render(<DashboardLayout />);

    const creationOptions = mockUseGameAccountCreation.mock.calls[0]?.[0];
    expect(creationOptions).toBeDefined();
    creationOptions?.onGameAccountSelected();

    expect(mockRouterReplace).toHaveBeenCalledWith('/dashboard/overview');
  });

  it('does not gate the Dashboard navigator on an explicit Store selection', async () => {
    mockDashboardAccount = {
      ...mockDashboardAccount,
      selectedGameAccount: null,
    };

    await render(<DashboardLayout />);

    expect(mockDashboardFrame).toHaveBeenCalledTimes(1);
    expect(mockDashboardTabs).toHaveBeenCalledTimes(1);
    expect(mockSelectGameAccount).not.toHaveBeenCalled();
  });

  it('redirects the Dashboard index to the static default page', async () => {
    await render(<DashboardIndexRoute />);

    expect(mockRedirect).toHaveBeenCalledWith({
      href: '/dashboard/overview',
    }, undefined);
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
