import type { PropsWithChildren } from 'react';
import { render } from '@testing-library/react-native';
import { DarkTheme } from 'expo-router';
import { Text } from 'react-native';

import { AppProvider } from './app-provider';

const mockThemeProvider = jest.fn(
  ({ children }: PropsWithChildren<{ value: unknown }>) => children,
);
const mockHideAsync = jest.fn(() => Promise.resolve());

jest.mock('../tamagui.generated.css', () => ({}));

jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
}));

jest.mock('expo-router', () => ({
  DarkTheme: {
    dark: true,
    colors: {
      background: 'rgb(1, 1, 1)',
      border: 'rgb(39, 39, 41)',
      card: 'rgb(18, 18, 18)',
      notification: 'rgb(255, 69, 58)',
      primary: 'rgb(10, 132, 255)',
      text: 'rgb(229, 229, 231)',
    },
    fonts: {
      bold: { fontFamily: 'System', fontWeight: '600' },
      heavy: { fontFamily: 'System', fontWeight: '700' },
      medium: { fontFamily: 'System', fontWeight: '500' },
      regular: { fontFamily: 'System', fontWeight: '400' },
    },
  },
  ThemeProvider: (props: PropsWithChildren<{ value: unknown }>) => mockThemeProvider(props),
}));

jest.mock('expo-splash-screen', () => ({
  hideAsync: () => mockHideAsync(),
  preventAutoHideAsync: () => Promise.resolve(),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: PropsWithChildren) => children,
}));

jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: PropsWithChildren) => children,
}));

jest.mock('tamagui', () => ({
  TamaguiProvider: ({ children }: PropsWithChildren) => children,
}));

jest.mock('../../tamagui.config', () => ({
  tamaguiConfig: {},
}));

jest.mock('./localization-provider', () => ({
  LocalizationProvider: ({ children }: PropsWithChildren) => children,
}));

describe('AppProvider', () => {
  beforeEach(() => {
    mockThemeProvider.mockClear();
    mockHideAsync.mockClear();
  });

  it('keeps navigation scenes transparent over the session backdrop', async () => {
    await render(
      <AppProvider>
        <Text>App content</Text>
      </AppProvider>,
    );

    expect(mockThemeProvider).toHaveBeenCalledTimes(1);
    const providerProps = mockThemeProvider.mock.calls.at(-1)?.[0];
    expect(providerProps?.children).toBeDefined();
    expect(providerProps?.value).toEqual({
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        background: 'transparent',
      },
    });
    expect(DarkTheme.colors.background).toBe('rgb(1, 1, 1)');
  });
});
