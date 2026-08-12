import type { PropsWithChildren } from 'react';
import { act, render } from '@testing-library/react-native';
import { View } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import { HorizontalSwipeSurface } from './horizontal-swipe-surface';
import { tamaguiConfig } from '../../../tamagui.config';

type MotionSample = {
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
};

type PanGestureMock = {
  activeOffsetX: jest.Mock<PanGestureMock, [number[]]>;
  cancelsTouchesInView: jest.Mock<PanGestureMock, [boolean]>;
  enabled: jest.Mock<PanGestureMock, [boolean]>;
  failOffsetY: jest.Mock<PanGestureMock, [number[]]>;
  onEnd: jest.Mock<PanGestureMock, [(sample: MotionSample, success: boolean) => void]>;
  onFinalize: jest.Mock<PanGestureMock, [(sample: MotionSample, success: boolean) => void]>;
  onStart: jest.Mock<PanGestureMock, [(sample: MotionSample) => void]>;
  onUpdate: jest.Mock<PanGestureMock, [(sample: MotionSample) => void]>;
  runOnJS: jest.Mock<PanGestureMock, [boolean]>;
};

let pan: PanGestureMock | null = null;

function TestTree({ children }: PropsWithChildren) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      {children}
    </TamaguiProvider>
  );
}

function mockCreatePanGesture(): PanGestureMock {
  const chain = <Arguments extends unknown[]>() => jest.fn<PanGestureMock, Arguments>();
  const gesture: PanGestureMock = {
    activeOffsetX: chain<[number[]]>(),
    cancelsTouchesInView: chain<[boolean]>(),
    enabled: chain<[boolean]>(),
    failOffsetY: chain<[number[]]>(),
    onEnd: chain<[(sample: MotionSample, success: boolean) => void]>(),
    onFinalize: chain<[(sample: MotionSample, success: boolean) => void]>(),
    onStart: chain<[(sample: MotionSample) => void]>(),
    onUpdate: chain<[(sample: MotionSample) => void]>(),
    runOnJS: chain<[boolean]>(),
  };
  for (const method of Object.values(gesture)) method.mockReturnValue(gesture);
  pan = gesture;
  return gesture;
}

jest.mock('react-native-gesture-handler', () => ({
  Gesture: { Pan: mockCreatePanGesture },
  GestureDetector: ({ children }: PropsWithChildren) => children,
}));

jest.mock('react-native-worklets', () => {
  const actual = jest.requireActual<typeof import('react-native-worklets')>('react-native-worklets');
  return { ...actual, scheduleOnRN: (callback: (direction: 'left' | 'right') => void, direction: 'left' | 'right') => callback(direction) };
});

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const reanimatedMock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');
  return { ...actual, ...reanimatedMock, useReducedMotion: () => true };
});

describe('HorizontalSwipeSurface', () => {
  beforeEach(() => {
    pan = null;
  });

  it('uses one early-lock pan gesture for the current content', async () => {
    await render(
      <TestTree>
        <HorizontalSwipeSurface canSwipeLeft canSwipeRight contentKey="first" enabled onSwipe={jest.fn()}>
          <View />
        </HorizontalSwipeSurface>
      </TestTree>,
    );

    expect(pan?.enabled).toHaveBeenCalledWith(true);
    expect(pan?.activeOffsetX).toHaveBeenCalledWith([-8, 8]);
    expect(pan?.failOffsetY).toHaveBeenCalledWith([-40, 40]);
    expect(pan?.cancelsTouchesInView).toHaveBeenCalledWith(true);
    expect(pan?.onStart).toHaveBeenCalledTimes(1);
    expect(pan?.onUpdate).toHaveBeenCalledTimes(1);
    expect(pan?.onEnd).toHaveBeenCalledTimes(1);
  });

  it('commits only after a valid swipe resolves to an available target', async () => {
    const onSwipe = jest.fn();
    await render(
      <TestTree>
        <HorizontalSwipeSurface canSwipeLeft canSwipeRight={false} contentKey="first" enabled onSwipe={onSwipe}>
          <View />
        </HorizontalSwipeSurface>
      </TestTree>,
    );
    const startGesture = pan?.onStart.mock.calls[0]?.[0];
    const endGesture = pan?.onEnd.mock.calls[0]?.[0];
    if (!startGesture || !endGesture) throw new Error('Expected horizontal pan handlers.');

    await act(() => {
      startGesture({ translationX: -8, translationY: 0, velocityX: 0, velocityY: 0 });
      endGesture({ translationX: -40, translationY: 0, velocityX: 0, velocityY: 0 }, true);
      return Promise.resolve();
    });

    expect(onSwipe).toHaveBeenCalledWith('left');
  });

  it('does not commit at a boundary or after crossing the gesture origin', async () => {
    const onSwipe = jest.fn();
    await render(
      <TestTree>
        <HorizontalSwipeSurface canSwipeLeft={false} canSwipeRight contentKey="first" enabled onSwipe={onSwipe}>
          <View />
        </HorizontalSwipeSurface>
      </TestTree>,
    );
    const startGesture = pan?.onStart.mock.calls[0]?.[0];
    const updateGesture = pan?.onUpdate.mock.calls[0]?.[0];
    const endGesture = pan?.onEnd.mock.calls[0]?.[0];
    if (!startGesture || !updateGesture || !endGesture) {
      throw new Error('Expected horizontal pan handlers.');
    }

    await act(() => {
      startGesture({ translationX: -8, translationY: 0, velocityX: 0, velocityY: 0 });
      endGesture({ translationX: -40, translationY: 0, velocityX: 0, velocityY: 0 }, true);
      startGesture({ translationX: 8, translationY: 0, velocityX: 0, velocityY: 0 });
      updateGesture({ translationX: -1, translationY: 0, velocityX: 0, velocityY: 0 });
      endGesture({ translationX: -40, translationY: 0, velocityX: 0, velocityY: 0 }, true);
      return Promise.resolve();
    });

    expect(onSwipe).not.toHaveBeenCalled();
  });
});
