import { fireEvent, render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';

import { HorizontalSwipeProvider } from '@/components';
import { i18n } from '@/i18n';
import { tamaguiConfig } from '../../../tamagui.config';
import { AccountSettingsScreen } from './screens/account-settings-screen';

jest.mock('react-native-reanimated', () => {
  const reanimated = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const reanimatedMock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');

  return {
    ...reanimated,
    ...reanimatedMock,
    useReducedMotion: () => true,
  };
});

async function renderAccountSettings() {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>
        <HorizontalSwipeProvider>
          <AccountSettingsScreen />
        </HorizontalSwipeProvider>
      </I18nextProvider>
    </TamaguiProvider>,
  );
}

describe('AccountSettingsScreen', () => {
  it('shows field-level validation and clears an issue when its field changes', async () => {
    const screen = await renderAccountSettings();
    const submitButton = screen.getByTestId('account-password-submit');
    const currentPasswordError = i18n.t('settings:account.validation.currentPasswordRequired');

    await fireEvent.press(submitButton);

    expect(screen.getByText(`// ${currentPasswordError}`)).toBeTruthy();

    const passwordInputs = screen.getAllByPlaceholderText(
      i18n.t('settings:account.passwordPlaceholder'),
    );
    const currentPasswordInput = passwordInputs[0];
    if (!currentPasswordInput) throw new Error('Current password input is missing.');
    await fireEvent.changeText(currentPasswordInput, 'current-password');

    expect(screen.queryByText(`// ${currentPasswordError}`)).toBeNull();
  });

  it('reports mismatched new passwords on the confirmation field', async () => {
    const screen = await renderAccountSettings();
    const passwordInputs = screen.getAllByPlaceholderText(
      i18n.t('settings:account.passwordPlaceholder'),
    );
    const currentPasswordInput = passwordInputs[0];
    const newPasswordInput = passwordInputs[1];
    const repeatNewPasswordInput = passwordInputs[2];
    if (!currentPasswordInput || !newPasswordInput || !repeatNewPasswordInput) {
      throw new Error('Password inputs are incomplete.');
    }
    const mismatchError = i18n.t('settings:account.validation.passwordsMismatch');

    await fireEvent.changeText(currentPasswordInput, 'current-password');
    await fireEvent.changeText(newPasswordInput, 'new-password');
    await fireEvent.changeText(repeatNewPasswordInput, 'different-password');
    await fireEvent.press(screen.getByTestId('account-password-submit'));

    expect(screen.getByText(`// ${mismatchError}`)).toBeTruthy();
  });
});
