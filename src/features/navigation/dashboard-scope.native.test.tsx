import type { PropsWithChildren } from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

let mockIsFocused = true;

jest.mock('expo-router', () => ({
  useIsFocused: () => mockIsFocused,
}));

jest.mock('tamagui', () => {
  const { View: MockView } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    YStack: ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => (
      <MockView {...props}>{children}</MockView>
    ),
  };
});

const DashboardScope = jest.requireActual<
  typeof import('./dashboard-scope.native')
>('./dashboard-scope.native').DashboardScope;

describe('native DashboardScope', () => {
  beforeEach(() => {
    mockIsFocused = true;
  });

  it('shows its mounted content while Dashboard is focused', async () => {
    const screen = await render(
      <DashboardScope>
        <Text>Dashboard content</Text>
      </DashboardScope>,
    );

    expect(screen.getByTestId('dashboard-scope').props.opacity).toBe(1);
    expect(screen.getByText('Dashboard content')).toBeTruthy();
  });

  it('hides its mounted content while Dashboard is unfocused', async () => {
    mockIsFocused = false;

    const screen = await render(
      <DashboardScope>
        <Text>Dashboard content</Text>
      </DashboardScope>,
    );

    expect(screen.getByTestId('dashboard-scope').props.opacity).toBe(0);
    expect(screen.getByText('Dashboard content')).toBeTruthy();
  });
});
