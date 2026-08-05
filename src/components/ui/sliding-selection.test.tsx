import { fireEvent, render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import { tamaguiConfig } from '../../../tamagui.config';
import { SlidingSelection } from './sliding-selection';

type MockSharedValue = {
  set: jest.Mock;
  value: unknown;
};

const mockSharedValues: MockSharedValue[] = [];

jest.mock('react-native-reanimated', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const reanimated = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const reanimatedMock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');

  return {
    ...reanimated,
    ...reanimatedMock,
    useReducedMotion: () => true,
    useSharedValue: (initialValue: unknown) => {
      const sharedValueRef = React.useRef<MockSharedValue | null>(null);
      if (sharedValueRef.current === null) {
        const sharedValue: MockSharedValue = {
          set: jest.fn((nextValue: unknown) => {
            sharedValue.value = nextValue;
          }),
          value: initialValue,
        };
        sharedValueRef.current = sharedValue;
        mockSharedValues.push(sharedValue);
      }
      return sharedValueRef.current;
    },
  };
});

function SelectionFixture({ value }: { value: string }) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <SlidingSelection
        testID="selection-track"
        value={value}
        indicator={<View testID="selection-indicator" />}
        width="100%"
        flexDirection="column"
      >
        <SlidingSelection.Item testID="first-item" value="first" width="100%">
          <Text>First</Text>
        </SlidingSelection.Item>
        <SlidingSelection.Item testID="second-item" value="second" width="100%">
          <Text>Second</Text>
        </SlidingSelection.Item>
      </SlidingSelection>
    </TamaguiProvider>
  );
}

function getSelectionSharedValues() {
  const indicatorReady = mockSharedValues.at(-5);
  const x = mockSharedValues.at(-4);
  const y = mockSharedValues.at(-3);
  const width = mockSharedValues.at(-2);
  const height = mockSharedValues.at(-1);
  if (!indicatorReady || !x || !y || !width || !height) {
    throw new Error('SlidingSelection shared values are missing.');
  }
  return { height, indicatorReady, width, x, y };
}

describe('SlidingSelection', () => {
  beforeEach(() => {
    mockSharedValues.length = 0;
  });

  it('accepts vertical layout props and moves the indicator to measured items', async () => {
    const screen = await render(<SelectionFixture value="first" />);
    const sharedValues = getSelectionSharedValues();

    expect(screen.getByTestId('selection-track')).toHaveStyle({
      flexDirection: 'column',
      width: '100%',
    });

    await fireEvent(screen.getByTestId('first-item'), 'layout', {
      nativeEvent: { layout: { height: 40, width: 180, x: 0, y: 0 } },
    });

    expect(sharedValues.indicatorReady.set).toHaveBeenLastCalledWith(1);
    expect(sharedValues.height.set).toHaveBeenLastCalledWith(40);
    expect(sharedValues.width.set).toHaveBeenLastCalledWith(180);
    expect(sharedValues.x.set).toHaveBeenLastCalledWith(0);
    expect(sharedValues.y.set).toHaveBeenLastCalledWith(0);

    await fireEvent(screen.getByTestId('second-item'), 'layout', {
      nativeEvent: { layout: { height: 72, width: 180, x: 0, y: 53 } },
    });
    await screen.rerender(<SelectionFixture value="second" />);

    expect(sharedValues.height.set).toHaveBeenLastCalledWith(72);
    expect(sharedValues.width.set).toHaveBeenLastCalledWith(180);
    expect(sharedValues.x.set).toHaveBeenLastCalledWith(0);
    expect(sharedValues.y.set).toHaveBeenLastCalledWith(53);
  });

  it('hides a stale indicator when the selected value has no measured item', async () => {
    const screen = await render(<SelectionFixture value="first" />);
    const { indicatorReady } = getSelectionSharedValues();
    await fireEvent(screen.getByTestId('first-item'), 'layout', {
      nativeEvent: { layout: { height: 40, width: 180, x: 0, y: 0 } },
    });
    expect(indicatorReady.set).toHaveBeenLastCalledWith(1);

    await screen.rerender(<SelectionFixture value="missing" />);

    expect(indicatorReady.set).toHaveBeenLastCalledWith(0);
  });

  it('preserves an item onLayout callback while registering its layout', async () => {
    const onLayout = jest.fn();
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <SlidingSelection value="first" indicator={<View />}>
          <SlidingSelection.Item testID="item" value="first" onLayout={onLayout}>
            <Text>First</Text>
          </SlidingSelection.Item>
        </SlidingSelection>
      </TamaguiProvider>,
    );
    const layoutEvent = {
      nativeEvent: { layout: { height: 40, width: 180, x: 0, y: 0 } },
    };

    await fireEvent(screen.getByTestId('item'), 'layout', layoutEvent);

    expect(onLayout).toHaveBeenCalledWith(expect.objectContaining(layoutEvent));
  });
});
