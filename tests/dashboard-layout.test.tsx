import { render } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

const mockRedirect = jest.fn(() => null);
const mockDashboardTabs = jest.fn(({ children }: PropsWithChildren) => children);
const mockDashboardTabsScreen = jest.fn(() => null);
const mockDashboardFrameRender = jest.fn();
const mockDashboardFrameMount = jest.fn();
const mockTerminalMarqueeMount = jest.fn();
const mockDashboardRouteProvider = jest.fn(({ children }: PropsWithChildren) => children);
const mockDashboardSmallScreenTabBar = jest.fn(() => null);
const mockUseLayoutSize = jest.fn(() => 'small' as const);
const mockSetBackdropTint = jest.fn();

const mockNavigateToAccount = (pageId: string, account: string) => ({
  pathname: `/dashboard/${pageId}`,
  params: { gameAccountId: account },
});

type MockGameAccount = { account: string };

let mockRoute: {
  gameAccountId: string | null;
  gameAccount: MockGameAccount | null;
  gameAccounts: MockGameAccount[];
  gameAccountsQuery: {
    data?: MockGameAccount[];
    isError: boolean;
    isPending: boolean;
  };
} = {
  gameAccountId: 'account-1',
  gameAccount: { account: 'account-1' },
  gameAccounts: [
    { account: 'account-1' },
    { account: 'account-2' },
    { account: 'account-3' },
  ],
  gameAccountsQuery: {
    data: [
      { account: 'account-1' },
      { account: 'account-2' },
      { account: 'account-3' },
    ],
    isError: false,
    isPending: false,
  },
};

jest.mock('expo-router', () => ({
  Redirect: mockRedirect,
}));

jest.mock('expo-router/tabs', () => ({
  Tabs: Object.assign(mockDashboardTabs, { Screen: mockDashboardTabsScreen }),
}));

jest.mock('tamagui', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Spinner: () => null,
    YStack: ({ children }: PropsWithChildren<{ [key: string]: unknown }>) => <View>{children}</View>,
    getTokens: () => ({
      color: {
        appAccent: { val: '#00ff00' },
        appMuted: { val: '#888888' },
        appWarning: { val: '#ffff00' },
      },
    }),
  };
});

jest.mock('@/components', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return { MonoText: ({ children }: PropsWithChildren) => <Text>{children}</Text> };
});

jest.mock('@/providers/layout-size-provider', () => ({
  useLayoutSize: mockUseLayoutSize,
}));

jest.mock('@/features/dashboard', () => ({
  DashboardRouteProvider: mockDashboardRouteProvider,
  selectBackdropTint: () => '#00ff00',
  useDashboardRoute: () => mockRoute,
}));

jest.mock('@/features/navigation', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    DashboardFrame: function MockDashboardFrame({ children }: PropsWithChildren) {
      React.useEffect(() => {
        mockDashboardFrameMount();
        mockTerminalMarqueeMount();
      }, []);
      mockDashboardFrameRender();
      return children;
    },
    DashboardSmallScreenTabBar: mockDashboardSmallScreenTabBar,
    dashboardNavigation: {
      defaultPage: { id: 'overview', segment: 'overview' },
      pages: {
        overview: { id: 'overview', segment: 'overview' },
        settings: { id: 'settings', segment: 'settings' },
        operators: { id: 'operators', segment: 'operators' },
        inventory: { id: 'inventory', segment: 'inventory' },
        activity: { id: 'activity', segment: 'activity' },
      },
    },
    dashboardPageHref: mockNavigateToAccount,
  };
});

jest.mock('@/features/session', () => ({
  useSessionBackdrop: () => ({ setBackdropTint: mockSetBackdropTint }),
}));

const DashboardLayout = jest.requireActual<
  typeof import('../src/app/(app)/dashboard/_layout')
>('../src/app/(app)/dashboard/_layout').default;

function setActiveAccount(account: string) {
  const gameAccount = mockRoute.gameAccounts.find((candidate) => candidate.account === account);
  if (!gameAccount) throw new Error(`Missing mock account ${account}.`);
  mockRoute = { ...mockRoute, gameAccount, gameAccountId: account };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseLayoutSize.mockReturnValue('small');
  mockRoute = {
    gameAccountId: 'account-1',
    gameAccount: { account: 'account-1' },
    gameAccounts: [
      { account: 'account-1' },
      { account: 'account-2' },
      { account: 'account-3' },
    ],
    gameAccountsQuery: {
      data: [
        { account: 'account-1' },
        { account: 'account-2' },
        { account: 'account-3' },
      ],
      isError: false,
      isPending: false,
    },
  };
});

describe('Dashboard route layout', () => {
  it('canonicalizes a missing account search param to the first account', async () => {
    mockRoute = { ...mockRoute, gameAccount: null, gameAccountId: null };

    await render(<DashboardLayout />);

    expect(mockRedirect).toHaveBeenCalledWith({
      href: {
        pathname: '/dashboard/overview',
        params: { gameAccountId: 'account-1' },
      },
    }, undefined);
  });

  it('owns the provider, stable frame, marquee, and page tabs above account selection', async () => {
    await render(<DashboardLayout />);

    expect(mockDashboardRouteProvider).toHaveBeenCalledTimes(1);
    expect(mockDashboardFrameMount).toHaveBeenCalledTimes(1);
    expect(mockTerminalMarqueeMount).toHaveBeenCalledTimes(1);
    expect(mockDashboardTabsScreen).toHaveBeenCalledTimes(5);
  });

  it('does not remount the frame or marquee across G1, G2, and G3', async () => {
    const screen = await render(<DashboardLayout />);

    setActiveAccount('account-2');
    await screen.rerender(<DashboardLayout />);
    setActiveAccount('account-3');
    await screen.rerender(<DashboardLayout />);

    expect(mockDashboardFrameRender).toHaveBeenCalledTimes(3);
    expect(mockDashboardFrameMount).toHaveBeenCalledTimes(1);
    expect(mockTerminalMarqueeMount).toHaveBeenCalledTimes(1);
  });
});
