import { fireEvent, render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';

import { i18n } from '@/i18n';
import { tamaguiConfig } from '../../../tamagui.config';
import { SettingsSwipeProvider } from './settings-swipe-context';
import { SettingsMockProvider } from './settings-mock-context';
import { NetworkSettingsScreen } from './screens/network-settings-screen';

jest.mock('@/providers/layout-size-provider', () => ({
  useLayoutSize: () => 'small',
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

async function renderNetworkSettings() {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>
        <SettingsSwipeProvider enabled onSwipe={jest.fn()}>
          <SettingsMockProvider>
            <NetworkSettingsScreen />
          </SettingsMockProvider>
        </SettingsSwipeProvider>
      </I18nextProvider>
    </TamaguiProvider>,
  );
}

describe('NetworkSettingsScreen API Node selection', () => {
  it('keeps RadioGroup selection behavior while using the shared scale states', async () => {
    const consoleInfo = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    const screen = await renderNetworkSettings();
    const domesticOption = screen.getByTestId('api-node-option-domestic');
    const overseasOption = screen.getByTestId('api-node-option-overseas');

    expect(domesticOption).toHaveStyle({ transform: [{ scale: 1 }, { scale: 1 }] });
    expect(overseasOption).toHaveStyle({ transform: [{ scale: 1 }, { scale: 0.985 }] });

    await fireEvent.press(overseasOption);

    expect(screen.getByTestId('api-node-option-domestic')).toHaveStyle({
      transform: [{ scale: 1 }, { scale: 0.985 }],
    });
    expect(screen.getByTestId('api-node-option-overseas')).toHaveStyle({
      transform: [{ scale: 1 }, { scale: 1 }],
    });
    expect(screen.getByTestId('api-node-option-overseas').props['aria-checked']).toBe(true);
    expect(screen.getByRole('radio', {
      name: i18n.t('settings:network.nodes.overseas'),
    })).toBeTruthy();
    consoleInfo.mockRestore();
  });
});
