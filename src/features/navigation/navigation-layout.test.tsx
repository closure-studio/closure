import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, YStack } from 'tamagui';

import { tamaguiConfig } from '../../../tamagui.config';
import {
  NavigationLayout,
} from './screens/navigation-layout';

const mockUsePathname = jest.fn(() => '/dashboard/overview');
const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();
let mockLayoutSize: 'small' | 'large' = 'small';
const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, right: 0, bottom: 34, left: 0 },
};

jest.mock('expo-router', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({
    back: jest.fn(),
    canDismiss: jest.fn(() => true),
    push: mockRouterPush,
    replace: mockRouterReplace,
  }),
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

jest.mock('./back-navigation', () => ({
  navigateBackToDashboard: jest.fn(),
  useNavigationBackHandler: jest.fn(),
}));

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
    mockRouterPush.mockClear();
    mockRouterReplace.mockClear();
    mockLayoutSize = 'small';
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
    expect(screen.getByTestId('settings-route-content')).toBeTruthy();
    expect(screen.queryByTestId('settings-scope-backdrop')).toBeNull();
  });

  it('issues one navigation command when opening Settings', async () => {
    const screen = await render(<NavigationTestTree scope="dashboard" />);

    await fireEvent.press(screen.getByLabelText('navigation:scopeSwitcher.openSettings'));

    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith('/settings/network');
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
});
