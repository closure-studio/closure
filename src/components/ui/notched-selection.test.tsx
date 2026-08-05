import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import { tamaguiConfig } from '../../../tamagui.config';
import { NotchedButton } from './notched-selection';

jest.mock('react-native-reanimated', () => {
  const reanimated = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const reanimatedMock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');

  return {
    ...reanimated,
    ...reanimatedMock,
    useReducedMotion: () => true,
  };
});

function NotchedButtonFixture({ isSelected }: { isSelected?: boolean }) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <NotchedButton
        testID="notched-button"
        {...(isSelected === undefined ? {} : { isSelected })}
      >
        <Text>Option</Text>
      </NotchedButton>
    </TamaguiProvider>
  );
}

describe('NotchedButton', () => {
  it('scales inactive and selected options consistently', async () => {
    const screen = await render(<NotchedButtonFixture isSelected={false} />);

    expect(screen.getByTestId('notched-button')).toHaveStyle({
      transform: [{ scale: 1 }, { scale: 0.985 }],
    });

    await screen.rerender(<NotchedButtonFixture isSelected />);

    expect(screen.getByTestId('notched-button')).toHaveStyle({
      transform: [{ scale: 1 }, { scale: 1 }],
    });
  });

  it('keeps non-selection actions at neutral scale', async () => {
    const screen = await render(<NotchedButtonFixture />);

    expect(screen.getByTestId('notched-button')).toHaveStyle({
      transform: [{ scale: 1 }, { scale: 1 }],
    });
  });
});
