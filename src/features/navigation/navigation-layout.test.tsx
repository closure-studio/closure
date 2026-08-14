import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, YStack } from 'tamagui';

import type { HorizontalSwipeDirection } from '@/utils/horizontal-swipe';
import { tamaguiConfig } from '../../../tamagui.config';
import {
  NavigationLayout,
} from './screens/navigation-layout';

const mockUsePathname = jest.fn(() => '/dashboard/overview');
const mockRouterReplace = jest.fn();
const mockReturnToDashboard = jest.fn();
const mockUseSelectedGameAccount = jest.fn<{ nickname: string; avatar: { id: string; type: string } } | null, []>();
const mockGetGameAvatarImageUrl = jest.fn<string | null, [unknown]>();
let mockLayoutSize: 'small' | 'large' = 'small';
const mockSurfaceRecords: {
  enabled: boolean;
  onSwipe: (direction: HorizontalSwipeDirection) => void;
}[] = [];
const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, right: 0, bottom: 34, left: 0 },
};

jest.mock('expo-router', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ replace: mockRouterReplace }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: (namespace: string) => ({
    t: (key: string) => `${namespace}:${key}`,
  }),
}));

jest.mock('react-native-reanimated', () => {
  const reanimated = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const reanimatedMock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');

  return {
    ...reanimated,
    ...reanimatedMock,
    useReducedMotion: () => true,
  };
});

jest.mock('@/providers/layout-size-provider', () => ({
  useLayoutSize: () => mockLayoutSize,
}));

jest.mock('@/features/dashboard', () => ({
  useSelectedGameAccount: () => mockUseSelectedGameAccount(),
  getGameAvatarImageUrl: (avatar: unknown) => mockGetGameAvatarImageUrl(avatar),
}));

jest.mock('./back-navigation', () => ({
  useNavigationBackHandler: jest.fn(),
  useSettingsBackNavigation: () => ({
    enterSettings: jest.fn(),
    returnToDashboard: mockReturnToDashboard,
  }),
}));

jest.mock('@/components', () => {
  const actual = jest.requireActual<typeof import('@/components')>('@/components');

  return {
    ...actual,
    HorizontalSwipeSurface: ({
      children,
      enabled,
      onSwipe,
    }: {
      children: ReactElement;
      enabled: boolean;
      onSwipe: (direction: HorizontalSwipeDirection) => void;
    }) => {
      mockSurfaceRecords.push({ enabled, onSwipe });
      return children;
    },
  };
});

function NavigationTestTree({ scope }: { scope: 'dashboard' | 'settings' }) {
  return (
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <NavigationLayout onLogout={jest.fn()}>
          <YStack testID={`${scope}-route-content`} />
        </NavigationLayout>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}

describe('Small Screen NavigationLayout header', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard/overview');
    mockRouterReplace.mockClear();
    mockReturnToDashboard.mockClear();
    mockUseSelectedGameAccount.mockReturnValue(null);
    mockGetGameAvatarImageUrl.mockReturnValue(null);
    mockLayoutSize = 'small';
    mockSurfaceRecords.length = 0;
  });

  it('keeps exactly one top-level header while the navigation scope changes', async () => {
    const screen = await render(<NavigationTestTree scope="dashboard" />);

    expect(screen.getAllByTestId('navigation-layout-header')).toHaveLength(1);
    expect(screen.getAllByTestId('navigation-header')).toHaveLength(1);
    expect(screen.queryByLabelText('navigation:smallScreen.settingsTabsLabel')).toBeNull();
    expect(screen.getByTestId('dashboard-route-content')).toBeTruthy();

    mockUsePathname.mockReturnValue('/settings/network');
    await screen.rerender(<NavigationTestTree scope="settings" />);

    expect(screen.getAllByTestId('navigation-layout-header')).toHaveLength(1);
    expect(screen.queryByTestId('navigation-header')).toBeNull();
    expect(screen.getAllByLabelText('navigation:smallScreen.settingsTabsLabel')).toHaveLength(1);
    expect(screen.getByText('navigation:smallScreen.swipeHint')).toBeTruthy();
    expect(screen.getByTestId('settings-route-content')).toBeTruthy();
    expect(screen.queryByTestId('settings-scope-backdrop')).toBeNull();
  });

  it('shows the selected Game Account nickname as the dashboard header title', async () => {
    mockUseSelectedGameAccount.mockReturnValue({
      nickname: '欧皇大佬',
      avatar: { id: 'avatar_def_10', type: 'DEFAULT' },
    });
    mockGetGameAvatarImageUrl.mockReturnValue('https://example.test/avatar.webp');

    const screen = await render(<NavigationTestTree scope="dashboard" />);

    expect(screen.getByText('欧皇大佬')).toBeTruthy();
    expect(mockGetGameAvatarImageUrl).toHaveBeenCalledWith({ id: 'avatar_def_10', type: 'DEFAULT' });
  });

  it('keeps the settings page label as the header title on Large Screen Settings', async () => {
    mockLayoutSize = 'large';
    mockUsePathname.mockReturnValue('/settings/network');

    const screen = await render(<NavigationTestTree scope="settings" />);

    expect(screen.getByText('navigation:pages.network.label')).toBeTruthy();
  });
});

describe('NavigationLayout settings swipe surface', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/settings/network');
    mockRouterReplace.mockClear();
    mockReturnToDashboard.mockClear();
    mockUseSelectedGameAccount.mockReturnValue(null);
    mockGetGameAvatarImageUrl.mockReturnValue(null);
    mockLayoutSize = 'small';
    mockSurfaceRecords.length = 0;
  });

  it('keeps a single enabled surface wrapping the pager header and route content on Small Screen Settings', async () => {
    const screen = await render(<NavigationTestTree scope="settings" />);

    expect(mockSurfaceRecords).toHaveLength(1);
    expect(mockSurfaceRecords[0]?.enabled).toBe(true);
    expect(screen.getAllByLabelText('navigation:smallScreen.settingsTabsLabel')).toHaveLength(1);
    expect(screen.getByTestId('settings-route-content')).toBeTruthy();
  });

  it('keeps the same surface mounted but disabled on Dashboard', async () => {
    mockUsePathname.mockReturnValue('/dashboard/overview');
    const screen = await render(<NavigationTestTree scope="dashboard" />);

    expect(mockSurfaceRecords).toHaveLength(1);
    expect(mockSurfaceRecords[0]?.enabled).toBe(false);
    expect(screen.getByTestId('dashboard-route-content')).toBeTruthy();
  });

  it('keeps the same surface mounted but disabled on Large Screen Settings', async () => {
    mockLayoutSize = 'large';
    const screen = await render(<NavigationTestTree scope="settings" />);

    expect(mockSurfaceRecords).toHaveLength(1);
    expect(mockSurfaceRecords[0]?.enabled).toBe(false);
    expect(screen.getByTestId('settings-route-content')).toBeTruthy();
  });

  it('selects the next Settings Page for a left swipe', async () => {
    await render(<NavigationTestTree scope="settings" />);

    mockSurfaceRecords[0]?.onSwipe('left');

    expect(mockRouterReplace).toHaveBeenCalledWith('/settings/account');
    expect(mockReturnToDashboard).not.toHaveBeenCalled();
  });

  it('returns to Dashboard for a right swipe from the first Settings Page', async () => {
    await render(<NavigationTestTree scope="settings" />);

    mockSurfaceRecords[0]?.onSwipe('right');

    expect(mockReturnToDashboard).toHaveBeenCalledTimes(1);
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it('does not navigate for a left swipe past the final Settings Page', async () => {
    mockUsePathname.mockReturnValue('/settings/contributors');
    await render(<NavigationTestTree scope="settings" />);

    mockSurfaceRecords[0]?.onSwipe('left');

    expect(mockRouterReplace).not.toHaveBeenCalled();
    expect(mockReturnToDashboard).not.toHaveBeenCalled();
  });
});
