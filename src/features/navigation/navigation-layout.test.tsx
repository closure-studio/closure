import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, YStack } from 'tamagui';

import { HorizontalSwipeProvider } from '@/components';
import { tamaguiConfig } from '../../../tamagui.config';
import {
  NavigationLayout,
} from './screens/navigation-layout';

const mockUsePathname = jest.fn(() => '/dashboard/overview');
const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, right: 0, bottom: 34, left: 0 },
};

jest.mock('expo-router', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ replace: jest.fn() }),
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

jest.mock('tamagui', () => {
  const tamagui = jest.requireActual<typeof import('tamagui')>('tamagui');

  return {
    ...tamagui,
    useMedia: () => ({ 'max-md': true }),
  };
});

jest.mock('./back-navigation', () => ({
  useNavigationBackHandler: jest.fn(),
  useSettingsBackNavigation: () => ({
    enterSettings: jest.fn(),
    returnToDashboard: jest.fn(),
  }),
}));

function NavigationTestTree({ scope }: { scope: 'dashboard' | 'settings' }) {
  return (
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <HorizontalSwipeProvider>
          <NavigationLayout onLogout={jest.fn()}>
            <YStack testID={`${scope}-route-content`} />
          </NavigationLayout>
        </HorizontalSwipeProvider>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}

describe('compact NavigationLayout header', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard/overview');
  });

  it('keeps exactly one top-level header while the navigation scope changes', async () => {
    const screen = await render(<NavigationTestTree scope="dashboard" />);

    expect(screen.getAllByTestId('navigation-layout-header')).toHaveLength(1);
    expect(screen.getAllByTestId('navigation-header')).toHaveLength(1);
    expect(screen.queryByLabelText('navigation:mobile.settingsTabsLabel')).toBeNull();
    expect(screen.getByTestId('dashboard-route-content')).toBeTruthy();

    mockUsePathname.mockReturnValue('/settings/network');
    await screen.rerender(<NavigationTestTree scope="settings" />);

    expect(screen.getAllByTestId('navigation-layout-header')).toHaveLength(1);
    expect(screen.queryByTestId('navigation-header')).toBeNull();
    expect(screen.getAllByLabelText('navigation:mobile.settingsTabsLabel')).toHaveLength(1);
    expect(screen.getByText('navigation:mobile.swipeHint')).toBeTruthy();
    expect(screen.getByTestId('settings-route-content')).toBeTruthy();
    expect(screen.queryByTestId('settings-scope-backdrop')).toBeNull();
  });
});
