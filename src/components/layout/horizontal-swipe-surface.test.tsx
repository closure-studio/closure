import type { PropsWithChildren } from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';

import { HorizontalSwipeSurface } from './horizontal-swipe-surface';

const mockEnabled = jest.fn().mockReturnThis();
type PanEndHandler = (event: { translationX: number; translationY: number }) => void;
let mockEndHandler: PanEndHandler | undefined;
const mockGesture = {
  activeOffsetX: jest.fn().mockReturnThis(),
  cancelsTouchesInView: jest.fn().mockReturnThis(),
  enabled: mockEnabled,
  failOffsetY: jest.fn().mockReturnThis(),
  onEnd: jest.fn((handler: PanEndHandler) => {
    mockEndHandler = handler;
  }),
  runOnJS: jest.fn().mockReturnThis(),
};

jest.mock('react-native-gesture-handler', () => ({
  Gesture: { Pan: () => mockGesture },
  GestureDetector: ({ children }: PropsWithChildren) => children,
}));

describe('HorizontalSwipeSurface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEndHandler = undefined;
  });

  it('passes its enabled state directly to the pan gesture', async () => {
    const screen = await render(
      <HorizontalSwipeSurface enabled onSwipe={jest.fn()}>
        <View />
      </HorizontalSwipeSurface>,
    );

    expect(mockEnabled).toHaveBeenLastCalledWith(true);

    await screen.rerender(
      <HorizontalSwipeSurface enabled={false} onSwipe={jest.fn()}>
        <View />
      </HorizontalSwipeSurface>,
    );

    expect(mockEnabled).toHaveBeenLastCalledWith(false);
  });

  it('calls the explicit handler only for a resolved horizontal swipe', async () => {
    const onSwipe = jest.fn();
    await render(
      <HorizontalSwipeSurface enabled onSwipe={onSwipe}>
        <View />
      </HorizontalSwipeSurface>,
    );

    const onEnd = mockEndHandler;
    if (!onEnd) throw new Error('Expected a pan gesture end handler.');

    onEnd({ translationX: -40, translationY: 0 });
    onEnd({ translationX: 20, translationY: 0 });

    expect(onSwipe).toHaveBeenCalledTimes(1);
    expect(onSwipe).toHaveBeenCalledWith('left');
  });
});
