import { fireEvent, render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';
import { AccountForms } from '@/features/auth/components/account-forms';
import type { AccountFormsProps } from '@/features/auth/components/account-forms';
import { i18n } from '@/i18n';
import { tamaguiConfig } from '../tamagui.config';

jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated'),
  useReducedMotion: () => true,
}));

function props(overrides: Partial<AccountFormsProps> = {}): AccountFormsProps {
  return {
    view: 'login',
    initialEmail: '',
    submission: { error: null, isPending: false, kind: null, resetCompletedEmail: null },
    emailCode: { error: null, isPending: false, sentEmail: null },
    linuxDoAvailable: false,
    onViewChange: jest.fn(),
    onSubmit: jest.fn(),
    onSendCode: jest.fn(),
    onBeginLinuxDo: jest.fn(),
    onClearFeedback: jest.fn(),
    ...overrides,
  };
}

function form(value: AccountFormsProps) {
  return <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
    <I18nextProvider i18n={i18n}><AccountForms {...value} /></I18nextProvider>
  </TamaguiProvider>;
}

beforeAll(async () => { await i18n.changeLanguage('en'); });

it('uses the page gutter instead of a nested panel on small screens', async () => {
  const screen = await render(form(props()));
  expect(screen.getByTestId('auth-form-surface')).toHaveStyle({
    backgroundColor: 'transparent',
    overflow: 'visible',
  });
  expect(screen.queryByTestId('auth-form-surface-corner-top-left')).toBeNull();
});

it('does not repeat each form mode with a numbered title and description', async () => {
  const value = props();
  const screen = await render(form(value));

  expect(screen.queryByText('Passport access')).toBeNull();
  expect(screen.queryByText('Welcome back, Doctor. Your terminal awaits.')).toBeNull();

  await screen.rerender(form({ ...value, view: 'register' }));
  expect(screen.queryByText('Create your passport')).toBeNull();
  expect(screen.queryByText('One account to coordinate every front.')).toBeNull();

  await screen.rerender(form({ ...value, view: 'reset' }));
  expect(screen.queryByText('Reset your password')).toBeNull();
  expect(screen.queryByText('Receive a code at your registered email and choose a new password.')).toBeNull();
});

it('validates and focuses required login fields before submitting', async () => {
  const value = props();
  const screen = await render(form(value));
  await fireEvent.press(screen.getByText('Access terminal'));
  expect(screen.getByText(/Enter your email address\./)).toBeTruthy();
  expect(value.onSubmit).not.toHaveBeenCalled();
  await fireEvent.changeText(screen.getByPlaceholderText('doctor@example.com'), '  doctor@example.com  ');
  await fireEvent.changeText(screen.getByPlaceholderText('Enter password'), ' secret ');
  await fireEvent.press(screen.getByText('Access terminal'));
  expect(value.onSubmit).toHaveBeenCalledWith({
    identifier: 'doctor@example.com', kind: 'login', password: ' secret ',
  });
});

it('masks and reveals the password and renders reset errors from props', async () => {
  const screen = await render(form(props({
    view: 'reset',
    initialEmail: 'doctor@example.com',
    submission: { error: 'Request failed', isPending: false, kind: 'form', resetCompletedEmail: null },
  })));
  expect(screen.getByPlaceholderText('Enter password').props.secureTextEntry).toBe(true);
  await fireEvent.press(screen.getByLabelText('Show access key'));
  expect(screen.getByPlaceholderText('Enter password').props.secureTextEntry).toBe(false);
  expect(screen.getByText('Request failed')).toBeTruthy();
});

it('offers separate account and password recovery without submitting a login', async () => {
  const value = props();
  const screen = await render(form(value));
  await fireEvent.changeText(screen.getByPlaceholderText('doctor@example.com'), 'doctor@example.com');
  await fireEvent.press(screen.getByText('Forgot account?'));
  expect(screen.getByText('Account recovery is not available yet.')).toBeTruthy();
  await fireEvent.press(screen.getByText('Forgot password?'));
  expect(value.onViewChange).toHaveBeenCalledWith('reset', 'doctor@example.com');
  expect(value.onSubmit).not.toHaveBeenCalled();
});

it('does not start Linux.do authorization when unavailable', async () => {
  const value = props();
  const screen = await render(form(value));
  await fireEvent.press(screen.getByText('Continue with Linux.do'));
  expect(value.onBeginLinuxDo).not.toHaveBeenCalled();
});

it('starts web authorization independently of incomplete email fields', async () => {
  const value = props({ linuxDoAvailable: true });
  const screen = await render(form(value));
  await fireEvent.press(screen.getByText('Continue with Linux.do'));
  expect(value.onBeginLinuxDo).toHaveBeenCalledTimes(1);
  expect(value.onSubmit).not.toHaveBeenCalled();
});

it('blocks conflicting actions and input changes while a request is pending', async () => {
  const value = props({
    submission: { error: null, isPending: true, kind: 'form', resetCompletedEmail: null },
  });
  const screen = await render(form(value));
  expect(screen.getByPlaceholderText('doctor@example.com').props.editable).toBe(false);
  await fireEvent.press(screen.getByText('Processing'));
  await fireEvent.press(screen.getByText('Forgot password?'));
  expect(value.onSubmit).not.toHaveBeenCalled();
  expect(value.onViewChange).not.toHaveBeenCalled();
});

it('sends registration codes without requiring a password or agreement', async () => {
  const value = props({ view: 'register' });
  const screen = await render(form(value));
  await fireEvent.press(screen.getByText('Send code'));
  expect(value.onSendCode).not.toHaveBeenCalled();
  await fireEvent.changeText(screen.getByPlaceholderText('doctor@example.com'), ' doctor@example.com ');
  await fireEvent.press(screen.getByText('Send code'));
  expect(value.onSendCode).toHaveBeenCalledWith({ email: 'doctor@example.com' });
});

it('requires a valid password, code and agreement before registration', async () => {
  const value = props({ view: 'register' });
  const screen = await render(form(value));
  await fireEvent.changeText(screen.getByPlaceholderText('doctor@example.com'), 'doctor@example.com');
  await fireEvent.changeText(screen.getByPlaceholderText('Enter password'), 'short');
  await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));
  expect(screen.getByText(/Use at least 8 characters/)).toBeTruthy();
  await fireEvent.changeText(screen.getByPlaceholderText('Enter password'), 'password123');
  await fireEvent.changeText(screen.getByPlaceholderText('Enter code'), '123456');
  await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));
  expect(screen.getByText('Read and accept the terms of service and privacy policy.')).toBeTruthy();
  expect(value.onSubmit).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByRole('checkbox'));
  await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));
  expect(value.onSubmit).toHaveBeenCalledWith({
    code: '123456', email: 'doctor@example.com', kind: 'register', password: 'password123',
  });
});

it('resends codes and clears the old code when the destination changes', async () => {
  const value = props({
    view: 'reset',
    initialEmail: 'doctor@example.com',
    emailCode: { error: null, isPending: false, sentEmail: 'doctor@example.com' },
  });
  const screen = await render(form(value));
  expect(screen.getByText('A verification code has been sent to doctor@example.com.')).toBeTruthy();
  await fireEvent.press(screen.getByText('Resend code'));
  expect(value.onSendCode).toHaveBeenCalledWith({ email: 'doctor@example.com' });
  await fireEvent.changeText(screen.getByPlaceholderText('Enter code'), '123456');
  await fireEvent.changeText(screen.getByPlaceholderText('doctor@example.com'), 'another@example.com');
  expect(screen.getByPlaceholderText('Enter code').props.value).toBe('');
  expect(value.onClearFeedback).toHaveBeenCalled();
  expect(screen.queryByText('Resend code')).toBeNull();
});

it('renders verification code request errors beside the code controls', async () => {
  const screen = await render(form(props({
    view: 'register',
    emailCode: { error: 'Code request failed', isPending: false, sentEmail: null },
  })));

  expect(screen.getByText('Code request failed')).toBeTruthy();
});

it('submits a one-page password reset and offers the completed email on return', async () => {
  const value = props({ view: 'reset', initialEmail: 'doctor@example.com' });
  const screen = await render(form(value));
  await fireEvent.changeText(screen.getByPlaceholderText('Enter password'), 'password123');
  await fireEvent.changeText(screen.getByPlaceholderText('Enter code'), '123456');
  await fireEvent.press(screen.getByText('Reset password'));
  expect(value.onSubmit).toHaveBeenCalledWith({
    code: '123456', email: 'doctor@example.com', kind: 'reset-password', password: 'password123',
  });
  await screen.rerender(form({
    ...value,
    submission: { error: null, isPending: false, kind: 'form', resetCompletedEmail: 'doctor@example.com' },
  }));
  expect(screen.queryByPlaceholderText('Enter password')).toBeNull();
  await fireEvent.press(screen.getByText('Back to login'));
  expect(value.onViewChange).toHaveBeenCalledWith('login', 'doctor@example.com');
});

it('clears password and code drafts when switching the active form', async () => {
  const value = props();
  const screen = await render(form(value));
  await fireEvent.changeText(screen.getByPlaceholderText('Enter password'), 'secret-password');
  await screen.rerender(form({ ...value, view: 'register', initialEmail: 'doctor@example.com' }));
  expect(screen.getByPlaceholderText('Enter password').props.value).toBe('');
  expect(screen.getByPlaceholderText('doctor@example.com').props.value).toBe('doctor@example.com');
});
