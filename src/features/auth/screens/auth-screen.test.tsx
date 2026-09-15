import { fireEvent, render } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { Text } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';

import { i18n } from '@/i18n';
import { tamaguiConfig } from '../../../../tamagui.config';
import { AuthScreen } from './auth-screen';

const mockKeyboardAwareScrollView = jest.fn(
  ({ children }: PropsWithChildren<Record<string, unknown>>) => children,
);
const mockSafeAreaView = jest.fn(
  ({ children }: PropsWithChildren<Record<string, unknown>>) => children,
);

jest.mock('react-native-keyboard-controller', () => ({
  KeyboardAwareScrollView: (props: PropsWithChildren<Record<string, unknown>>) => (
    mockKeyboardAwareScrollView(props)
  ),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: (props: PropsWithChildren<Record<string, unknown>>) => mockSafeAreaView(props),
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

jest.mock('../components/access-orbit', () => ({
  AccessOrbit: () => null,
}));

function renderAuthScreen(onToggleRequestMode: () => void) {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>
        <AuthScreen onToggleRequestMode={onToggleRequestMode}>
          <Text>Auth form</Text>
        </AuthScreen>
      </I18nextProvider>
    </TamaguiProvider>,
  );
}

describe('AuthScreen request environment shortcut', () => {
  beforeEach(() => {
    mockKeyboardAwareScrollView.mockClear();
    mockSafeAreaView.mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('switches once on the fifth brand mark press', async () => {
    jest.useFakeTimers();
    const onToggleRequestMode = jest.fn<void, []>();
    const screen = await renderAuthScreen(onToggleRequestMode);
    const brandMark = screen.getByTestId('terminal-brand-mark');

    for (let press = 0; press < 4; press += 1) {
      await fireEvent.press(brandMark);
    }
    expect(onToggleRequestMode).not.toHaveBeenCalled();

    await fireEvent.press(brandMark);
    expect(onToggleRequestMode).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Auth form')).toBeTruthy();

    for (let press = 0; press < 10; press += 1) {
      await fireEvent.press(brandMark);
    }
    expect(onToggleRequestMode).toHaveBeenCalledTimes(1);
  });

  it('keeps focused fields visible with keyboard-aware scrolling', async () => {
    const onToggleRequestMode = jest.fn<void, []>();
    const screen = await renderAuthScreen(onToggleRequestMode);

    expect(mockKeyboardAwareScrollView).toHaveBeenCalledTimes(1);
    expect(mockKeyboardAwareScrollView.mock.calls[0]?.[0]).toEqual(expect.objectContaining({
      bottomOffset: 18,
      keyboardDismissMode: process.env.EXPO_OS === 'ios' ? 'interactive' : 'on-drag',
      keyboardShouldPersistTaps: 'handled',
      mode: 'insets',
      showsVerticalScrollIndicator: false,
    }));
    expect(screen.getByTestId('auth-screen-main')).toHaveStyle({
      flexGrow: 1,
      justifyContent: 'flex-start',
    });
    expect(mockSafeAreaView.mock.calls[0]?.[0]).toEqual(expect.objectContaining({
      edges: ['bottom'],
    }));
  });

});
