import { fireEvent, render } from '@testing-library/react-native';
import { Grid2X2, PanelsTopLeft } from 'lucide-react-native';
import { TamaguiProvider } from 'tamagui';

import { tamaguiConfig } from '../../../tamagui.config';
import { MobileBottomNavigation } from './components/mobile-bottom-navigation';

async function renderMobileBottomNavigation(onSelect = jest.fn()) {
  const screen = await render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <MobileBottomNavigation
        activeId="overview"
        items={[
          { id: 'overview', icon: Grid2X2, label: 'Overview' },
          { id: 'site', icon: PanelsTopLeft, label: 'Site settings' },
        ]}
        navigationKey="dashboard"
        onSelect={onSelect}
        reducedMotion
      />
    </TamaguiProvider>,
  );

  return { onSelect, screen };
}

describe('MobileBottomNavigation', () => {
  it('renders only the supplied navigation set and marks the active tab', async () => {
    const { screen } = await renderMobileBottomNavigation();

    expect(screen.getByText('Overview')).toBeTruthy();
    expect(screen.getByText('Site settings')).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Overview' }).props['aria-selected']).toBe(true);
  });

  it('reports the selected item id without owning route behavior', async () => {
    const { onSelect, screen } = await renderMobileBottomNavigation();

    await fireEvent.press(screen.getByText('Site settings'));

    expect(onSelect).toHaveBeenCalledWith('site');
  });
});
