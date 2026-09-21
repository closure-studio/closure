import { fireEvent, render } from '@testing-library/react-native';
import { setMediaState } from '@tamagui/web';
import { I18nextProvider } from 'react-i18next';
import { useState } from 'react';
import { TamaguiProvider } from 'tamagui';

import { i18n } from '@/i18n';
import { tamaguiConfig } from '../../../../../tamagui.config';
import { AccountSettingsScreen } from './account-settings-screen';
import type { SessionPrincipal } from '@/schemas/auth';
import type { QQBindingController } from '../use-qq-binding';

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

function createQQBindingController(
  overrides: Partial<QQBindingController> = {},
): QQBindingController {
  return {
    copyStatus: 'idle',
    dialogOpen: false,
    error: null,
    groupOpenFailed: false,
    isChecking: false,
    isFetching: false,
    queryStatus: 'success',
    state: { status: 'unbound', verificationCode: 'verifyCode:test-link' },
    timedOut: false,
    copyVerificationCode: jest.fn().mockResolvedValue(undefined),
    openGroup: jest.fn().mockResolvedValue(undefined),
    retry: jest.fn(),
    setDialogOpen: jest.fn(),
    startChecking: jest.fn(),
    stopChecking: jest.fn(),
    ...overrides,
  };
}

async function renderAccountSettings(
  qqBindingOverrides: Partial<QQBindingController> = {},
) {
  const onLogout = jest.fn();
  const qqBindingActions = createQQBindingController(qqBindingOverrides);

  function TestAccountSettings() {
    const [qqDialogOpen, setQQDialogOpen] = useState(qqBindingActions.dialogOpen);
    const qqBinding: QQBindingController = {
      ...qqBindingActions,
      dialogOpen: qqDialogOpen,
      setDialogOpen: (open) => {
        qqBindingActions.setDialogOpen(open);
        setQQDialogOpen(open);
      },
    };

    return (
      <AccountSettingsScreen
        onLogout={onLogout}
        onUpdatePassword={jest.fn<Promise<boolean>, [Parameters<React.ComponentProps<typeof AccountSettingsScreen>['onUpdatePassword']>[0]]>().mockResolvedValue(true)}
        passwordUpdateError={null}
        passwordUpdateStatus="idle"
        principal={principal}
        qqBinding={qqBinding}
      />
    );
  }

  const screen = await render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>
        <TestAccountSettings />
      </I18nextProvider>
    </TamaguiProvider>,
  );
  return { onLogout, qqBinding: qqBindingActions, screen };
}

async function openPasswordDialog(screen: Awaited<ReturnType<typeof renderAccountSettings>>['screen']) {
  await fireEvent.press(screen.getByTestId('account-password-trigger'));
  expect(screen.getByTestId('account-password-sheet')).toBeTruthy();
}

describe('AccountSettingsScreen', () => {
  beforeEach(() => {
    setMediaState({ large: false });
  });

  it('shows the account identity once without repeating the email', async () => {
    const { screen } = await renderAccountSettings();

    expect(screen.getAllByText(principal.email)).toHaveLength(1);
    expect(screen.getByText(i18n.t('settings:account.roles.member'))).toBeTruthy();
    expect(screen.getByText(i18n.t('settings:account.identityStatuses.active'))).toBeTruthy();
    expect(screen.getByText(i18n.t('settings:account.passwordTitle'))).toBeTruthy();
    expect(screen.getByText(i18n.t('settings:account.qqBinding.unboundStatus'))).toBeTruthy();
    expect(screen.queryByText(i18n.t('settings:account.description'))).toBeNull();
  });

  it('pushes the mobile logout action to the bottom of the available page', async () => {
    const { screen } = await renderAccountSettings();

    expect(screen.getByTestId('account-settings-content')).toHaveStyle({ flexGrow: 1 });
    expect(screen.getByTestId('account-logout-footer')).toHaveStyle({ marginTop: 'auto' });
  });

  it('shows field-level validation and clears an issue when its field changes', async () => {
    const { screen } = await renderAccountSettings();
    await openPasswordDialog(screen);
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
    await openPasswordDialog(screen);
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

  it('opens a redesigned three-step QQ binding sheet', async () => {
    const { qqBinding, screen } = await renderAccountSettings();

    await fireEvent.press(screen.getByTestId('account-qq-binding-trigger'));

    expect(screen.getByTestId('account-qq-binding-sheet')).toBeTruthy();
    expect(screen.getByTestId('account-qq-binding-code')).toHaveTextContent('verifyCode:test-link');
    expect(screen.getByText('1345795')).toBeTruthy();
    expect(screen.getByText('450555868')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('account-qq-binding-copy'));
    await fireEvent.press(screen.getByTestId('account-qq-binding-group-primary'));
    await fireEvent.press(screen.getByTestId('account-qq-binding-start-checking'));

    expect(qqBinding.copyVerificationCode).toHaveBeenCalledTimes(1);
    expect(qqBinding.openGroup).toHaveBeenCalledTimes(1);
    expect(qqBinding.startChecking).toHaveBeenCalledTimes(1);
  });

  it('shows the compact completed state for an already linked QQ account', async () => {
    const { screen } = await renderAccountSettings({
      state: { status: 'bound', verificationCode: null },
    });

    expect(screen.getByText(i18n.t('settings:account.qqBinding.boundStatus'))).toBeTruthy();
    await fireEvent.press(screen.getByTestId('account-qq-binding-trigger'));

    expect(screen.getByTestId('account-qq-binding-bound')).toBeTruthy();
    expect(screen.queryByTestId('account-qq-binding-code')).toBeNull();
  });

  it('shows QQ status loading while the account query is pending', async () => {
    const { screen } = await renderAccountSettings({
      isFetching: true,
      queryStatus: 'pending',
      state: null,
    });

    expect(screen.getByText(i18n.t('settings:account.qqBinding.checkingStatus'))).toBeTruthy();
    await fireEvent.press(screen.getByTestId('account-qq-binding-trigger'));
    expect(screen.getByTestId('account-qq-binding-panel')).toBeTruthy();
  });

  it('shows an unavailable QQ state and retries from the dialog', async () => {
    const { qqBinding, screen } = await renderAccountSettings({
      error: { code: 'network-unavailable', kind: 'transport' },
      queryStatus: 'error',
      state: null,
    });

    expect(screen.getByText(i18n.t('settings:account.qqBinding.unavailableStatus'))).toBeTruthy();
    await fireEvent.press(screen.getByTestId('account-qq-binding-trigger'));
    expect(screen.getByText(i18n.t('settings:account.qqBinding.errors.unavailable'))).toBeTruthy();
    await fireEvent.press(screen.getByTestId('account-qq-binding-retry'));
    expect(qqBinding.retry).toHaveBeenCalledTimes(1);
  });

  it('opens QQ binding as a dialog on large screens', async () => {
    setMediaState({ large: true });
    const { screen } = await renderAccountSettings();

    await fireEvent.press(screen.getByTestId('account-qq-binding-trigger'));

    expect(screen.getByTestId('account-qq-binding-dialog')).toBeTruthy();
    expect(screen.getByTestId('account-qq-binding-code')).toBeTruthy();
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

  it('opens the password editor as a dialog on large screens', async () => {
    setMediaState({ large: true });
    const { screen } = await renderAccountSettings();

    await fireEvent.press(screen.getByTestId('account-password-trigger'));

    expect(screen.getByTestId('account-password-dialog')).toBeTruthy();
    expect(screen.getAllByPlaceholderText(i18n.t('settings:account.passwordPlaceholder'))).toHaveLength(3);
  });

  it('clears password drafts when the editor closes', async () => {
    setMediaState({ large: true });
    const { screen } = await renderAccountSettings();

    await fireEvent.press(screen.getByTestId('account-password-trigger'));
    const currentPasswordInput = screen.getAllByPlaceholderText(
      i18n.t('settings:account.passwordPlaceholder'),
    )[0];
    if (!currentPasswordInput) throw new Error('Current password input is missing.');
    await fireEvent.changeText(currentPasswordInput, 'sensitive-password');
    await fireEvent.press(screen.getByTestId('account-password-dialog-close'));
    await fireEvent.press(screen.getByTestId('account-password-trigger'));

    expect(screen.getAllByPlaceholderText(
      i18n.t('settings:account.passwordPlaceholder'),
    )[0]?.props.value).toBe('');
  });
});
