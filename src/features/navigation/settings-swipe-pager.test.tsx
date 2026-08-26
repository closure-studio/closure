import { fireEvent, render } from '@testing-library/react-native';
import { TamaguiProvider } from 'tamagui';

import { tamaguiConfig } from '../../../tamagui.config';
import { SettingsPagerTabs } from './components/settings-swipe-pager';
import { settingsNavigation } from './navigation-config';

jest.mock('react-native-reanimated', () => {
  const reanimated = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const reanimatedMock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');

  return {
    ...reanimated,
    ...reanimatedMock,
    useReducedMotion: () => true,
  };
});

const settingsItems = Object.values(settingsNavigation.pages)
  .sort((left, right) => left.sort - right.sort)
  .map(({ id }) => ({ id, label: id }));

async function renderSettingsPagerTabs(activeId: 'network' | 'account' | 'contributors' = 'network') {
  const onBack = jest.fn();
  const onSelect = jest.fn();
  const screen = await render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <SettingsPagerTabs
        activeId={activeId}
        backLabel="Return to Dashboard"
        items={settingsItems}
        onBack={onBack}
        onSelect={onSelect}
        swipeHint="SWIPE L/R"
        tabListLabel="Settings tabs"
      />
    </TamaguiProvider>,
  );

  return { onBack, onSelect, screen };
}

describe('SettingsPagerTabs', () => {
  it('uses the active navigator page as the selected tab', async () => {
    const { screen } = await renderSettingsPagerTabs();
    const tabList = screen.getByLabelText('Settings tabs');

    expect(tabList.props['aria-label']).toBe('Settings tabs');
    expect(screen.getByText('SWIPE L/R')).toBeTruthy();
    expect(screen.getByTestId('settings-swipe-hint')).toHaveStyle({
      transform: [{ translateX: 0 }],
    });
    expect(screen.getByRole('tab', { name: 'network' }).props['aria-selected']).toBe(true);
  });

  it('returns to Dashboard from the first page', async () => {
    const { onBack, screen } = await renderSettingsPagerTabs();

    await fireEvent.press(screen.getByLabelText('Return to Dashboard'));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('uses the arrow controls to select adjacent navigator pages', async () => {
    const { onBack, onSelect, screen } = await renderSettingsPagerTabs('account');

    await fireEvent.press(screen.getByTestId('settings-previous-icon'));
    await fireEvent.press(screen.getByTestId('settings-next-icon'));

    expect(onSelect).toHaveBeenNthCalledWith(1, 'network');
    expect(onSelect).toHaveBeenNthCalledWith(2, 'contributors');
    expect(onBack).not.toHaveBeenCalled();
  });

  it('keeps the final forward control disabled', async () => {
    const { screen } = await renderSettingsPagerTabs('contributors');

    expect(screen.getByTestId('settings-next-icon')).toBeDisabled();
    expect(screen.getByTestId('settings-next-icon')).toHaveStyle({ opacity: 0.28 });
  });
});
