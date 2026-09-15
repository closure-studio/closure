import { fireEvent, render } from '@testing-library/react-native';
import { setMediaState } from '@tamagui/web';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';

import { i18n } from '@/i18n';
import { tamaguiConfig } from '../../../../../tamagui.config';
import { AccountSettingsScreen } from './account-settings-screen';
import type { SessionPrincipal } from '@/schemas/auth';

jest.mock('@/hooks/use-back-dismissal', () => ({
  useBackDismissal: jest.fn(),
}));

const principal = {
  email: 'doctor@rhodes.is',
  id: 'user-closure-01',
  permission: 112,
  registeredAt: '2025-01-14T08:30:00.000Z',
  status: 'active',
} satisfies SessionPrincipal;

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
  const onLogout = jest.fn();
  const screen = await render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>
        <AccountSettingsScreen
          onLogout={onLogout}
          onUpdatePassword={jest.fn<Promise<boolean>, [Parameters<React.ComponentProps<typeof AccountSettingsScreen>['onUpdatePassword']>[0]]>().mockResolvedValue(true)}
          passwordUpdateError={null}
          passwordUpdateStatus="idle"
          principal={principal}
        />
      </I18nextProvider>
    </TamaguiProvider>,
  );
  return { onLogout, screen };
}

describe('AccountSettingsScreen', () => {
  beforeEach(() => {
    setMediaState({ large: false });
  });

  it('shows field-level validation and clears an issue when its field changes', async () => {
    const { screen } = await renderAccountSettings();
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
    const { screen } = await renderAccountSettings();
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

  it('requires confirmation before logging out', async () => {
    const { onLogout, screen } = await renderAccountSettings();

    expect(screen.queryByTestId('account-logout-panel')).toBeNull();
    await fireEvent.press(screen.getByTestId('account-logout-trigger'));

    expect(screen.getByTestId('account-logout-sheet')).toBeTruthy();
    expect(screen.getByText(i18n.t('settings:account.logout.confirmTitle'))).toBeTruthy();
    expect(onLogout).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('account-logout-confirm'));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('cancels logout without ending the session', async () => {
    const { onLogout, screen } = await renderAccountSettings();

    await fireEvent.press(screen.getByTestId('account-logout-trigger'));
    await fireEvent.press(screen.getByTestId('account-logout-cancel'));

    expect(onLogout).not.toHaveBeenCalled();
  });

  it('leaves logout to the sidebar on large screens', async () => {
    setMediaState({ large: true });

    const { screen } = await renderAccountSettings();

    expect(screen.queryByTestId('account-logout-trigger')).toBeNull();
  });
});
