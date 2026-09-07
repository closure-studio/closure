import type { PropsWithChildren } from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('tamagui', () => {
  const { View: MockView } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    YStack: ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => (
      <MockView {...props}>{children}</MockView>
    ),
  };
});

const DashboardScope = jest.requireActual<
  typeof import('./dashboard-scope.web')
>('./dashboard-scope.web').DashboardScope;

describe('web DashboardScope', () => {
  it('renders Dashboard without native focus visibility', async () => {
    const screen = await render(
      <DashboardScope>
        <Text>Dashboard content</Text>
      </DashboardScope>,
    );

    expect(screen.getByTestId('dashboard-scope').props.opacity).toBeUndefined();
    expect(screen.getByText('Dashboard content')).toBeTruthy();
  });
});
