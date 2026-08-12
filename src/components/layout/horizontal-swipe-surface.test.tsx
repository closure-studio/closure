import type { PropsWithChildren } from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';

import { HorizontalSwipeSurface } from './horizontal-swipe-surface';

type MotionSample = {
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
};

type PanGestureMock = {
  activeOffsetX: jest.Mock;
  cancelsTouchesInView: jest.Mock;
  enabled: jest.Mock;
  failOffsetY: jest.Mock;
  minVelocityX: jest.Mock;
  onEnd(handler: (motion: MotionSample, success: boolean) => void): PanGestureMock;
  runOnJS: jest.Mock;
};

const mockPans: PanGestureMock[] = [];
let mockEndHandlers: ((motion: MotionSample, success: boolean) => void)[] = [];
let mockRacedGestures: unknown[] = [];

jest.mock('react-native-gesture-handler', () => ({
  Gesture: {
    Pan: () => {
      const pan: PanGestureMock = {
        activeOffsetX: jest.fn().mockReturnThis(),
        cancelsTouchesInView: jest.fn().mockReturnThis(),
        enabled: jest.fn().mockReturnThis(),
        failOffsetY: jest.fn().mockReturnThis(),
        minVelocityX: jest.fn().mockReturnThis(),
        onEnd(handler: (motion: MotionSample, success: boolean) => void) {
          mockEndHandlers.push(handler);
          return this;
        },
        runOnJS: jest.fn().mockReturnThis(),
      };
      mockPans.push(pan);
      return pan;
    },
    Race: (...gestures: unknown[]) => {
      mockRacedGestures = gestures;
      return { type: 'race', gestures };
    },
  },
  GestureDetector: ({ children }: PropsWithChildren) => children,
}));

describe('HorizontalSwipeSurface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPans.length = 0;
    mockEndHandlers = [];
    mockRacedGestures = [];
  });

  it('passes its enabled state directly to both directional pan gestures', async () => {
    const onSwipe = jest.fn();
    const screen = await render(
      <HorizontalSwipeSurface enabled onSwipe={onSwipe}>
        <View />
      </HorizontalSwipeSurface>,
    );
    const initiallyEnabledPans = mockPans.slice();

    expect(initiallyEnabledPans).toHaveLength(2);
    expect(initiallyEnabledPans[0]?.enabled).toHaveBeenCalledWith(true);
    expect(initiallyEnabledPans[1]?.enabled).toHaveBeenCalledWith(true);

    await screen.rerender(
      <HorizontalSwipeSurface enabled={false} onSwipe={onSwipe}>
        <View />
      </HorizontalSwipeSurface>,
    );
    const disabledPans = mockPans.slice(initiallyEnabledPans.length);

    expect(disabledPans).toHaveLength(2);
    expect(disabledPans[0]?.enabled).toHaveBeenCalledWith(false);
    expect(disabledPans[1]?.enabled).toHaveBeenCalledWith(false);
  });

  it('configures opposing capture offsets and velocity thresholds on the directional pans', async () => {
    await render(
      <HorizontalSwipeSurface enabled onSwipe={jest.fn()}>
        <View />
      </HorizontalSwipeSurface>,
    );
    const [leftPan, rightPan] = mockPans;

    expect(leftPan?.activeOffsetX).toHaveBeenCalledWith(-39);
    expect(rightPan?.activeOffsetX).toHaveBeenCalledWith(39);
    expect(leftPan?.minVelocityX).toHaveBeenCalledWith(-800);
    expect(rightPan?.minVelocityX).toHaveBeenCalledWith(800);
  });

  it('keeps the shared vertical failure range on both directional pans', async () => {
    await render(
      <HorizontalSwipeSurface enabled onSwipe={jest.fn()}>
        <View />
      </HorizontalSwipeSurface>,
    );
    const [leftPan, rightPan] = mockPans;

    expect(leftPan?.failOffsetY).toHaveBeenCalledWith([-40, 40]);
    expect(rightPan?.failOffsetY).toHaveBeenCalledWith([-40, 40]);
  });

  it('races the two directional pans instead of running them simultaneously', async () => {
    await render(
      <HorizontalSwipeSurface enabled onSwipe={jest.fn()}>
        <View />
      </HorizontalSwipeSurface>,
    );
    const [leftPan, rightPan] = mockPans;

    expect(mockRacedGestures).toHaveLength(2);
    expect(mockRacedGestures[0]).toBe(leftPan);
    expect(mockRacedGestures[1]).toBe(rightPan);
  });

  it('calls the handler once per resolved short fast flick', async () => {
    const onSwipe = jest.fn();
    await render(
      <HorizontalSwipeSurface enabled onSwipe={onSwipe}>
        <View />
      </HorizontalSwipeSurface>,
    );
    const onEnd = mockEndHandlers[0];
    if (!onEnd) throw new Error('Expected a pan gesture end handler.');

    onEnd({ translationX: 20, translationY: 2, velocityX: 1200, velocityY: 50 }, true);
    onEnd({ translationX: -20, translationY: 2, velocityX: -1200, velocityY: 50 }, true);

    expect(onSwipe).toHaveBeenCalledTimes(2);
    expect(onSwipe).toHaveBeenNthCalledWith(1, 'right');
    expect(onSwipe).toHaveBeenNthCalledWith(2, 'left');
  });

  it('does not call the handler for short slow or vertically dominated samples', async () => {
    const onSwipe = jest.fn();
    await render(
      <HorizontalSwipeSurface enabled onSwipe={onSwipe}>
        <View />
      </HorizontalSwipeSurface>,
    );
    const onEnd = mockEndHandlers[0];
    if (!onEnd) throw new Error('Expected a pan gesture end handler.');

    onEnd({ translationX: 20, translationY: 2, velocityX: 700, velocityY: 0 }, true);
    onEnd({ translationX: 20, translationY: 21, velocityX: 1200, velocityY: 0 }, true);

    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('calls the explicit handler only for a resolved distance swipe', async () => {
    const onSwipe = jest.fn();
    await render(
      <HorizontalSwipeSurface enabled onSwipe={onSwipe}>
        <View />
      </HorizontalSwipeSurface>,
    );
    const onEnd = mockEndHandlers[0];
    if (!onEnd) throw new Error('Expected a pan gesture end handler.');

    onEnd({ translationX: -40, translationY: 0, velocityX: 0, velocityY: 0 }, true);
    onEnd({ translationX: 20, translationY: 0, velocityX: 0, velocityY: 0 }, true);

    expect(onSwipe).toHaveBeenCalledTimes(1);
    expect(onSwipe).toHaveBeenCalledWith('left');
  });

  it('does not call the handler when an active gesture is cancelled', async () => {
    const onSwipe = jest.fn();
    await render(
      <HorizontalSwipeSurface enabled onSwipe={onSwipe}>
        <View />
      </HorizontalSwipeSurface>,
    );
    const onEnd = mockEndHandlers[0];
    if (!onEnd) throw new Error('Expected a pan gesture end handler.');

    onEnd({ translationX: -40, translationY: 0, velocityX: 0, velocityY: 0 }, false);

    expect(onSwipe).not.toHaveBeenCalled();
  });
});
