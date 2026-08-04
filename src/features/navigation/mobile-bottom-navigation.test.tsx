import { fireEvent, render } from '@testing-library/react-native';
import { Grid2X2, UsersRound } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';

import { tamaguiConfig } from '../../../tamagui.config';
import { MobileBottomNavigation } from './components/mobile-bottom-navigation';

const bottomInset = 34;
const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, right: 0, bottom: bottomInset, left: 0 },
};

async function renderMobileBottomNavigation(onSelect = jest.fn()) {
  const screen = await render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <MobileBottomNavigation
          activeId="overview"
          items={[
            { id: 'overview', icon: Grid2X2, label: 'Overview' },
            { id: 'operators', icon: UsersRound, label: 'Operators' },
          ]}
          onSelect={onSelect}
          reducedMotion
        />
      </TamaguiProvider>
    </SafeAreaProvider>,
  );

  return { onSelect, screen };
}

describe('MobileBottomNavigation', () => {
  it('extends its background through the bottom safe area', async () => {
    const { screen } = await renderMobileBottomNavigation();
    const navigation = screen.getByTestId('mobile-bottom-navigation');

    expect(StyleSheet.flatten(navigation.props.style)).toEqual(expect.objectContaining({
      height: 66 + bottomInset,
    }));
  });

  it('renders only the supplied navigation set and marks the active tab', async () => {
    const { screen } = await renderMobileBottomNavigation();

    expect(screen.getByText('Overview')).toBeTruthy();
    expect(screen.getByText('Operators')).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Overview' }).props['aria-selected']).toBe(true);
  });

  it('reports the selected item id without owning route behavior', async () => {
    const { onSelect, screen } = await renderMobileBottomNavigation();

    await fireEvent.press(screen.getByText('Operators'));

    expect(onSelect).toHaveBeenCalledWith('operators');
  });
});
