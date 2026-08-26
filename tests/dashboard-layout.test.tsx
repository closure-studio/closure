import { render } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

const mockSlot = jest.fn(() => null);
const mockRedirect = jest.fn(() => null);
const mockDashboardTabs = jest.fn(({ children }: PropsWithChildren) => children);
const mockDashboardTabsScreen = jest.fn(() => null);
const mockDashboardFrame = jest.fn(({ children }: PropsWithChildren) => children);
const mockDashboardRouteProvider = jest.fn(({ children }: PropsWithChildren) => children);
const mockDashboardSmallScreenTabBar = jest.fn(() => null);
const mockUseLayoutSize = jest.fn(() => 'small' as const);
const mockSetBackdropTint = jest.fn();

const mockNavigateToAccount = (pageId: string, account: string) => ({
  pathname: `/dashboard/[gameAccountId]/${pageId}`,
  params: { gameAccountId: account },
});

let mockRoute: {
  gameAccountId: string | null;
  gameAccount: { account: string } | null;
  gameAccounts: { account: string }[];
  gameAccountsQuery: { data?: { account: string }[]; isError: boolean; isPending: boolean };
} = {
  gameAccountId: 'account-1',
  gameAccount: { account: 'account-1' },
  gameAccounts: [{ account: 'account-1' }, { account: 'account-2' }],
  gameAccountsQuery: {
    data: [{ account: 'account-1' }, { account: 'account-2' }],
    isError: false,
    isPending: false,
  },
};

jest.mock('expo-router', () => ({
  Redirect: mockRedirect,
  Slot: mockSlot,
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
  useGameAccountsQuery: () => mockRoute.gameAccountsQuery,
  useDashboardRoute: () => mockRoute,
}));

jest.mock('@/features/navigation', () => ({
  DashboardFrame: mockDashboardFrame,
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
}));

jest.mock('@/features/navigation/navigation-config', () => ({
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
}));

jest.mock('@/features/session', () => ({
  useSessionBackdrop: () => ({ setBackdropTint: mockSetBackdropTint }),
}));

const DashboardLayout = jest.requireActual<
  typeof import('../src/app/(app)/dashboard/_layout')
>('../src/app/(app)/dashboard/_layout').default;
const DashboardIndexRoute = jest.requireActual<
  typeof import('../src/app/(app)/dashboard/index')
>('../src/app/(app)/dashboard/index').default;
const DashboardAccountLayout = jest.requireActual<
  typeof import('../src/app/(app)/dashboard/[gameAccountId]/_layout')
>('../src/app/(app)/dashboard/[gameAccountId]/_layout').default;

beforeEach(() => {
  mockSlot.mockClear();
  mockRedirect.mockClear();
  mockDashboardTabs.mockClear();
  mockDashboardTabsScreen.mockClear();
  mockDashboardFrame.mockClear();
  mockDashboardRouteProvider.mockClear();
  mockSetBackdropTint.mockClear();
  mockUseLayoutSize.mockReset();
  mockUseLayoutSize.mockReturnValue('small');
  mockRoute = {
    gameAccountId: 'account-1',
    gameAccount: { account: 'account-1' },
    gameAccounts: [{ account: 'account-1' }, { account: 'account-2' }],
    gameAccountsQuery: {
      data: [{ account: 'account-1' }, { account: 'account-2' }],
      isError: false,
      isPending: false,
    },
  };
});

describe('Dashboard route layouts', () => {
  it('routes the dashboard index to the first account overview', async () => {
    await render(<DashboardIndexRoute />);

    expect(mockRedirect).toHaveBeenCalledWith({
      href: {
        pathname: '/dashboard/[gameAccountId]/overview',
        params: { gameAccountId: 'account-1' },
      },
    }, undefined);
  });

  it('keeps the parent dashboard route as the Query-owned account-list gate', async () => {
    await render(<DashboardLayout />);

    expect(mockDashboardRouteProvider).not.toHaveBeenCalled();
    expect(mockSlot).toHaveBeenCalledTimes(1);
    expect(mockDashboardFrame).not.toHaveBeenCalled();
  });

  it('owns local route state and the frame in the dynamic account layout', async () => {
    await render(<DashboardAccountLayout />);

    expect(mockDashboardRouteProvider).toHaveBeenCalledTimes(1);
    expect(mockDashboardFrame).toHaveBeenCalledTimes(1);
    expect(mockDashboardTabs).toHaveBeenCalledWith(expect.objectContaining({
      screenOptions: expect.objectContaining({ animation: 'shift', headerShown: false }),
      tabBar: expect.any(Function),
    }), undefined);
    expect(mockDashboardTabsScreen).toHaveBeenCalledTimes(5);
  });

  it('redirects stale or foreign account IDs to the dashboard index', async () => {
    mockRoute = { ...mockRoute, gameAccountId: 'missing', gameAccount: null };

    await render(<DashboardAccountLayout />);

    expect(mockRedirect).toHaveBeenCalledWith({ href: '/dashboard' }, undefined);
  });
});
