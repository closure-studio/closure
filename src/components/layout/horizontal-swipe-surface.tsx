import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { IOS_BACK_GESTURE_EDGE_WIDTH_PT } from '@/constants/back-navigation';
import {
  HORIZONTAL_SWIPE_THRESHOLD_PT,
  resolveHorizontalSwipeDirection,
} from './horizontal-swipe';
import type { HorizontalSwipeDirection } from './horizontal-swipe';

export function HorizontalSwipeSurface({
  children,
  enabled,
  onSwipe,
}: {
  children: ReactElement;
  enabled: boolean;
  onSwipe: (direction: HorizontalSwipeDirection) => void;
}) {
  const panGesture = useMemo(
    () => {
      const gesture = Gesture.Pan()
        .enabled(enabled)
        .activeOffsetX([-HORIZONTAL_SWIPE_THRESHOLD_PT, HORIZONTAL_SWIPE_THRESHOLD_PT])
        .failOffsetY([-HORIZONTAL_SWIPE_THRESHOLD_PT, HORIZONTAL_SWIPE_THRESHOLD_PT])
        .cancelsTouchesInView(false)
        .runOnJS(true);

      if (process.env.EXPO_OS === 'ios') {
        gesture.hitSlop({ left: -IOS_BACK_GESTURE_EDGE_WIDTH_PT });
      }

      return gesture.onEnd(({ translationX, translationY }) => {
        const direction = resolveHorizontalSwipeDirection({ translationX, translationY });
        if (direction) onSwipe(direction);
      });
    },
    [enabled, onSwipe],
  );

  return (
    <GestureDetector
      gesture={panGesture}
      touchAction={enabled ? 'pan-y' : 'auto'}
    >
      {children}
    </GestureDetector>
  );
}
