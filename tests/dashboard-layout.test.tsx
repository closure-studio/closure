import { render } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

const mockSlot = jest.fn(() => null);
const mockRedirect = jest.fn(() => null);
const mockDashboardTabs = jest.fn(({ children }: PropsWithChildren) => children);
const mockDashboardTabsScreen = jest.fn(() => null);
const mockDashboardShell = jest.fn(({ children }: PropsWithChildren) => children);
const mockDashboardSmallScreenTabBar = jest.fn(() => null);
const mockRouterReplace = jest.fn();
const mockUseIsFocused = jest.fn(() => true);
const mockUsePathname = jest.fn(() => '/dashboard/account-1/overview');
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
  useIsFocused: mockUseIsFocused,
  usePathname: mockUsePathname,
  useRouter: () => ({ replace: mockRouterReplace }),
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
  DashboardShell: mockDashboardShell,
  selectBackdropTint: () => '#00ff00',
  useAdjacentGameAccountPrefetch: () => undefined,
  useDashboardRoute: () => mockRoute,
}));

jest.mock('@/features/navigation', () => ({
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
  getDashboardPageId: (pathname: string) => pathname.split('/').at(-1) ?? null,
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
  getDashboardPageId: (pathname: string) => pathname.split('/').at(-1) ?? null,
}));

jest.mock('@/features/session', () => ({
  useSessionBackdrop: () => ({ setBackdropTint: mockSetBackdropTint }),
}));

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
  mockDashboardShell.mockClear();
  mockRouterReplace.mockClear();
  mockSetBackdropTint.mockClear();
  mockUsePathname.mockReset();
  mockUsePathname.mockReturnValue('/dashboard/account-1/overview');
  mockUseIsFocused.mockReset();
  mockUseIsFocused.mockReturnValue(true);
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

  it('changes only the account segment when switching accounts', async () => {
    await render(<DashboardAccountLayout />);

    const shellProps = mockDashboardShell.mock.calls[0]?.[0];
    if (typeof shellProps !== 'object' || shellProps === null) throw new Error('Expected shell props.');
    const onSelect = Reflect.get(shellProps, 'onSelectGameAccount');
    if (typeof onSelect !== 'function') throw new Error('Expected account navigation callback.');
    Reflect.apply(onSelect, null, ['account-2']);

    expect(mockRouterReplace).toHaveBeenCalledWith({
      pathname: '/dashboard/[gameAccountId]/overview',
      params: { gameAccountId: 'account-2' },
    });
  });

  it('redirects stale or foreign account IDs to the dashboard index', async () => {
    mockRoute = { ...mockRoute, gameAccountId: 'missing', gameAccount: null };

    await render(<DashboardAccountLayout />);

    expect(mockRedirect).toHaveBeenCalledWith({ href: '/dashboard' }, undefined);
  });
});
