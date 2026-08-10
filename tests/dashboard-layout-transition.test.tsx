import type { PropsWithChildren } from 'react';
import { render } from '@testing-library/react-native';

const mockDashboardTabs = jest.fn((_props: unknown) => null);
const mockDashboardTabsScreen = jest.fn(() => null);
const mockDashboardMobileTabBar = jest.fn(() => null);
const mockGetTabScreenOptions = jest.fn((reducedMotion: boolean) => ({
  animation: reducedMotion ? 'none' : 'fade',
}));
const mockUseReducedMotion = jest.fn(() => false);
const mockUseMedia = jest.fn(() => ({ 'max-md': true }));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('expo-router/tabs', () => ({
  Tabs: Object.assign(mockDashboardTabs, { Screen: mockDashboardTabsScreen }),
}));

jest.mock('react-native-reanimated', () => {
  const reanimated = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const reanimatedMock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');

  return {
    ...reanimated,
    ...reanimatedMock,
    useReducedMotion: mockUseReducedMotion,
  };
});

jest.mock('tamagui', () => ({
  getTokens: () => ({
    color: {
      appAccent: { val: '#00ff00' },
      appMuted: { val: '#888888' },
      appWarning: { val: '#ffff00' },
    },
  }),
  useMedia: mockUseMedia,
}));

jest.mock('@/features/dashboard', () => ({
  DashboardProvider: ({ children }: PropsWithChildren) => children,
  DashboardShell: ({ children }: PropsWithChildren) => children,
  selectBackdropTint: () => '#00ff00',
  useDashboardState: () => ({
    activeGameAccount: { color: 'primary' },
    activeGameAccountId: 'account-1',
    gameAccounts: [],
    isLinkGameAccountSheetOpen: false,
    linkGameAccount: jest.fn(),
    selectGameAccount: jest.fn(),
    setIsLinkGameAccountSheetOpen: jest.fn(),
  }),
}));

jest.mock('@/features/navigation', () => ({
  DashboardMobileTabBar: mockDashboardMobileTabBar,
  dashboardNavigation: {
    defaultPage: { route: '/dashboard/overview' },
    pages: {
      inventory: { route: '/dashboard/inventory' },
    },
  },
}));

jest.mock('@/features/session', () => ({
  getTabScreenOptions: mockGetTabScreenOptions,
  useSessionBackdrop: () => ({ setBackdropTint: jest.fn() }),
}));

const DashboardLayout = jest.requireActual<
  typeof import('../src/app/(app)/dashboard/_layout')
>('../src/app/(app)/dashboard/_layout').default;

describe('DashboardLayout route transitions', () => {
  beforeEach(() => {
    mockDashboardTabs.mockClear();
    mockGetTabScreenOptions.mockClear();
    mockUseReducedMotion.mockReset();
    mockUseReducedMotion.mockReturnValue(false);
    mockUseMedia.mockReset();
    mockUseMedia.mockReturnValue({ 'max-md': true });
  });

  it('enables Dashboard route transitions when reduced motion is disabled', async () => {
    await render(<DashboardLayout />);

    expect(mockGetTabScreenOptions).toHaveBeenCalledWith(false);
    expect(mockDashboardTabs).toHaveBeenCalledWith(
      expect.objectContaining({
        detachInactiveScreens: false,
        screenOptions: { animation: 'fade' },
        tabBar: expect.any(Function),
      }),
      undefined,
    );
    const receivedProps = mockDashboardTabs.mock.calls[0]?.[0];
    if (typeof receivedProps !== 'object' || receivedProps === null) {
      throw new Error('Expected Dashboard Tabs props.');
    }
    const tabBar = Reflect.get(receivedProps, 'tabBar');
    if (typeof tabBar !== 'function') throw new Error('Expected a Dashboard tab bar renderer.');
    expect(Reflect.apply(tabBar, null, [{}])).toEqual(expect.objectContaining({
      props: expect.objectContaining({ reducedMotion: false }),
      type: mockDashboardMobileTabBar,
    }));
    expect(Reflect.get(receivedProps, 'children')).toEqual(expect.objectContaining({
      props: { name: 'index', options: { href: null } },
      type: mockDashboardTabsScreen,
    }));
  });

  it('renders no Dashboard tab bar on desktop', async () => {
    mockUseMedia.mockReturnValue({ 'max-md': false });

    await render(<DashboardLayout />);

    const receivedProps = mockDashboardTabs.mock.calls[0]?.[0];
    if (typeof receivedProps !== 'object' || receivedProps === null) {
      throw new Error('Expected Dashboard Tabs props.');
    }
    const tabBar = Reflect.get(receivedProps, 'tabBar');
    if (typeof tabBar !== 'function') throw new Error('Expected a Dashboard tab bar renderer.');
    expect(Reflect.apply(tabBar, null, [{}])).toBeNull();
  });

  it('disables Dashboard route transitions when reduced motion is enabled', async () => {
    mockUseReducedMotion.mockReturnValue(true);

    await render(<DashboardLayout />);

    expect(mockGetTabScreenOptions).toHaveBeenCalledWith(true);
    expect(mockDashboardTabs).toHaveBeenCalledWith(
      expect.objectContaining({ screenOptions: { animation: 'none' } }),
      undefined,
    );
  });
});
