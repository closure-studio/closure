import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { setMediaState } from '@tamagui/web';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';

import { i18n } from '@/i18n';
import type { ArkHostCreateGameInput } from '@/schemas/arkhost';
import { tamaguiConfig } from '../../../../tamagui.config';
import {
  EmptyGameAccountState,
  GameAccountCreationDialog,
} from './game-account-creation';

const mockSubmit = jest.fn<Promise<void>, [ArkHostCreateGameInput]>();
const mockClearError = jest.fn();

jest.mock('react-native-reanimated', () => {
  const reanimated = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const reanimatedMock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');
  return { ...reanimated, ...reanimatedMock, useReducedMotion: () => true };
});

jest.mock('@/hooks/use-back-dismissal', () => ({
  useBackDismissal: jest.fn(),
}));

async function renderDialog(onOpenChange = jest.fn()) {
  setMediaState({ large: true });
  const screen = await render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>
        <GameAccountCreationDialog
          error={null}
          isPending={false}
          open
          onClearError={mockClearError}
          onOpenChange={onOpenChange}
          onSubmit={mockSubmit}
        />
      </I18nextProvider>
    </TamaguiProvider>,
  );
  return { onOpenChange, screen };
}

describe('GameAccountCreationDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubmit.mockResolvedValue(undefined);
  });

  it('validates required credentials before creating an account', async () => {
    const { screen } = await renderDialog();

    await fireEvent.press(screen.getByTestId('create-game-account-submit'));

    expect(mockSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('// Enter your game account')).toBeTruthy();
  });

  it('submits the selected channel and normalized credentials', async () => {
    const { onOpenChange, screen } = await renderDialog();
    const [accountInput, passwordInput] = screen.getAllByDisplayValue('');
    if (!accountInput || !passwordInput) {
      throw new Error('Expected account and password inputs.');
    }

    await fireEvent.changeText(
      accountInput,
      '  doctor@example.com  ',
    );
    await fireEvent.changeText(
      passwordInput,
      ' secret ',
    );
    await fireEvent.press(screen.getByTestId('create-game-platform-2'));
    await fireEvent.press(screen.getByTestId('create-game-account-submit'));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        account: 'doctor@example.com',
        password: ' secret ',
        platform: 2,
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('delegates mutation cleanup to the dialog owner when closing', async () => {
    const { onOpenChange, screen } = await renderDialog();

    await fireEvent.press(screen.getByText('Cancel'));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(mockClearError).not.toHaveBeenCalled();
  });

  it('keeps the form focused on the required fields', async () => {
    const { screen } = await renderDialog();
    const inputs = screen.getAllByDisplayValue('');

    expect(inputs[0]?.props.placeholder).toBeUndefined();
    expect(inputs[1]?.props.placeholder).toBeUndefined();
    expect(screen.queryByText(/this service will use your password/i)).toBeNull();
  });
});

describe('EmptyGameAccountState', () => {
  it('keeps a clear recovery action after the automatic dialog is dismissed', async () => {
    const onAddGameAccount = jest.fn();
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <I18nextProvider i18n={i18n}>
          <EmptyGameAccountState onAddGameAccount={onAddGameAccount} />
        </I18nextProvider>
      </TamaguiProvider>,
    );

    await fireEvent.press(screen.getByText('Add game account'));

    expect(onAddGameAccount).toHaveBeenCalledTimes(1);
    expect(screen.getByText('No game account added')).toBeTruthy();
  });
});
