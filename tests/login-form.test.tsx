import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';

import { LoginForm } from '@/features/auth/components/login-form';
import { i18n } from '@/i18n';
import { tamaguiConfig } from '../tamagui.config';

jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated'),
  useReducedMotion: () => true,
}));

async function renderLoginForm(onSubmit: React.ComponentProps<typeof LoginForm>['onSubmit']) {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <I18nextProvider i18n={i18n}>
        <LoginForm onSubmit={onSubmit} />
      </I18nextProvider>
    </TamaguiProvider>,
  );
}

describe('LoginForm', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('en');
  });

  it('validates required fields before submitting', async () => {
    const onSubmit = jest.fn();
    const screen = await renderLoginForm(onSubmit);

    await fireEvent.press(screen.getByText('Access terminal'));

    expect(screen.getByText(/Enter your login credential/)).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('reports rejected submissions without leaking the rejection', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('network unavailable'));
    const screen = await renderLoginForm(onSubmit);

    await fireEvent.changeText(screen.getByPlaceholderText('doctor@rhodes.is'), '  doctor  ');
    await fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'access-key');
    await fireEvent.press(screen.getByText('Access terminal'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        username: 'doctor',
        password: 'access-key',
        remember: true,
      });
      expect(screen.getByText('Unable to establish a connection. Try again.')).toBeTruthy();
    });
  });

  it('submits an unchecked persistent session preference', async () => {
    const onSubmit = jest.fn();
    const screen = await renderLoginForm(onSubmit);

    await fireEvent.press(screen.getByRole('checkbox'));
    await fireEvent.changeText(screen.getByPlaceholderText('doctor@rhodes.is'), 'doctor');
    await fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'access-key');
    await fireEvent.press(screen.getByText('Access terminal'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        username: 'doctor',
        password: 'access-key',
        remember: false,
      });
    });
  });

  it('masks and reveals the access key', async () => {
    const screen = await renderLoginForm(jest.fn());
    const accessKeyInput = screen.getByPlaceholderText('••••••••');

    expect(accessKeyInput.props.secureTextEntry).toBe(true);

    await fireEvent.press(screen.getByLabelText('Show access key'));

    const revealedAccessKeyInput = screen.getByPlaceholderText('••••••••');
    expect(revealedAccessKeyInput.props.secureTextEntry).toBe(false);
    expect(screen.getByLabelText('Hide access key')).toBeTruthy();
  });
});
