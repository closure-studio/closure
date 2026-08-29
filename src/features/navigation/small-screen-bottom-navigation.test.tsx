import type { ComponentProps } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';
import type { BottomTabBarProps } from 'expo-router/tabs';

import { i18n } from '@/i18n';
import { tamaguiConfig } from '../../../tamagui.config';
import { DashboardSmallScreenTabBar } from './dashboard-small-screen-tab-bar';

const mockYStack = jest.fn();
const bottomInset = 34;
const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, right: 0, bottom: bottomInset, left: 0 },
};

jest.mock('react-native-reanimated', () => {
  const reanimated = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');

  return {
    ...reanimated,
    useReducedMotion: () => true,
  };
});

jest.mock('tamagui', () => {
  const tamagui = jest.requireActual<typeof import('tamagui')>('tamagui');
  const ActualYStack = tamagui.YStack;

  return {
    ...tamagui,
    YStack: (props: ComponentProps<typeof ActualYStack>) => {
      mockYStack(props);
      return <ActualYStack {...props} />;
    },
  };
});

async function renderMobileBottomNavigation(defaultPrevented = false) {
  const emit = jest.fn();
  emit.mockReturnValue({
    type: 'tabPress',
    target: 'operators-key',
    defaultPrevented,
    preventDefault: jest.fn(),
  });
  const navigate = jest.fn();
  const navigation = {
    canGoBack: jest.fn(),
    dispatch: jest.fn(),
    emit,
    getId: jest.fn(),
    getParent: jest.fn(),
    getState: jest.fn(),
    goBack: jest.fn(),
    isFocused: jest.fn(),
    navigate,
    navigateDeprecated: jest.fn(),
    preload: jest.fn(),
    replaceParams: jest.fn(),
    reset: jest.fn(),
    setParams: jest.fn(),
  } satisfies BottomTabBarProps['navigation'];
  const state = {
    index: 1,
    history: [],
    key: 'tab-key',
    preloadedRouteKeys: [],
    routeNames: ['index', 'overview', 'settings', 'operators', 'inventory', 'activity'],
    routes: [
      { key: 'index-key', name: 'index' },
      { key: 'overview-key', name: 'overview' },
      { key: 'settings-key', name: 'settings' },
      { key: 'operators-key', name: 'operators' },
      { key: 'inventory-key', name: 'inventory' },
      { key: 'activity-key', name: 'activity' },
    ],
    stale: false,
    type: 'tab',
  } satisfies BottomTabBarProps['state'];
  const screen = await render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <I18nextProvider i18n={i18n}>
          <DashboardSmallScreenTabBar
            descriptors={{}}
            insets={safeAreaMetrics.insets}
            navigation={navigation}
            state={state}
          />
        </I18nextProvider>
      </TamaguiProvider>
    </SafeAreaProvider>,
  );

  return { emit, navigate, screen };
}

describe('MobileBottomNavigation', () => {
  beforeEach(() => {
    mockYStack.mockClear();
  });

  it('keeps the active indicator static when reduced motion is enabled', async () => {
    await renderMobileBottomNavigation();

    expect(mockYStack).toHaveBeenCalledWith(expect.objectContaining({ transition: '0ms' }));
  });

  it('extends its background through the bottom safe area', async () => {
    const { screen } = await renderMobileBottomNavigation();
    const navigation = screen.getByTestId('small-screen-bottom-navigation');

    expect(StyleSheet.flatten(navigation.props.style)).toEqual(expect.objectContaining({
      height: 66 + bottomInset,
    }));
  });

  it('omits the index redirect route and marks the navigator active tab', async () => {
    const { screen } = await renderMobileBottomNavigation();

    expect(screen.getAllByRole('tab')).toHaveLength(5);
    expect(screen.getByRole('tab', { name: i18n.t('dashboard:navigation.sections.overview.label') }).props['aria-selected']).toBe(true);
  });

  it('navigates between static Dashboard page routes', async () => {
    const { emit, navigate, screen } = await renderMobileBottomNavigation();

    await fireEvent.press(screen.getByText(i18n.t('dashboard:navigation.sections.operators.label')));

    expect(emit).toHaveBeenCalledWith({
      type: 'tabPress',
      target: 'operators-key',
      canPreventDefault: true,
    });
    expect(navigate).toHaveBeenCalledWith('operators', undefined);
  });

  it('honors a prevented tabPress event', async () => {
    const { navigate, screen } = await renderMobileBottomNavigation(true);

    await fireEvent.press(screen.getByText(i18n.t('dashboard:navigation.sections.operators.label')));

    expect(navigate).not.toHaveBeenCalled();
  });
});
