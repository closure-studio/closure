import { render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';

import { AuthScreen } from '@/features/auth';
import { i18n } from '@/i18n';
import { tamaguiConfig } from '../tamagui.config';

jest.mock('@/features/auth/components/access-orbit', () => ({
  AccessOrbit: () => null,
}));

jest.mock('@/components/ui/motion/flickering-status-indicator', () => ({
  FlickeringStatusIndicator: () => null,
}));

jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated'),
  useReducedMotion: () => true,
}));

describe('AuthScreen', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('en');
  });

  it('uses the existing auth page for the pending session check', async () => {
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <I18nextProvider i18n={i18n}>
          <AuthScreen mode="checking" />
        </I18nextProvider>
      </TamaguiProvider>,
    );

    expect(screen.getByText('Closure · Studio')).toBeTruthy();
    expect(screen.getByTestId('auth-checking')).toHaveProp('accessibilityRole', 'progressbar');
    expect(screen.getByText('VERIFYING SESSION // STANDBY')).toBeTruthy();
    expect(screen.queryByText('Access terminal')).toBeNull();
  });
});
