import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import { tamaguiConfig } from '../../../tamagui.config';
import { NotchedButton, NotchedSurface } from './notched-selection';

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

function NotchedSurfaceFixture() {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <NotchedSurface fill="#000000" stroke="#ffffff" bracketColor="#ff0000" />
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

describe('NotchedSurface', () => {
  it('uses measured dimensions for its border and corner brackets', async () => {
    const screen = await render(<NotchedSurfaceFixture />);
    const root = screen.root;
    if (!root) throw new Error('NotchedSurface root is missing.');

    await fireEvent(root, 'layout', {
      nativeEvent: { layout: { height: 80, width: 120 } },
    });

    const bracketPath = [
      'M0.5,12 V0.5 H12',
      'M108,0.5 H119.5 V12',
      'M0.5,68 V79.5 H12',
      'M108,79.5 H119.5 V68',
    ].join(' ');
    const bracketPaths = screen.container.queryAll((node) => node.props.d === bracketPath);
    const clippedGroups = screen.container.queryAll((node) => (
      typeof node.props.clipPath === 'string'
      && node.props.clipPath.startsWith('notched-surface-')
    ));

    expect(bracketPaths).toHaveLength(1);
    expect(clippedGroups).toHaveLength(1);
    const [bracketPathInstance] = bracketPaths;
    if (!bracketPathInstance) throw new Error('NotchedSurface bracket path is missing.');
    expect(bracketPathInstance.props.strokeWidth).toBe(1);
  });
});
