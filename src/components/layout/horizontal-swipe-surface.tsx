import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { TextInput } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import {
  HORIZONTAL_SWIPE_DISTANCE_CAPTURE_OFFSET_PT,
  HORIZONTAL_SWIPE_DISTANCE_THRESHOLD_PT,
  HORIZONTAL_SWIPE_FLICK_VELOCITY_THRESHOLD_PT_PER_SECOND,
  resolveHorizontalSwipeDirection,
} from './horizontal-swipe';
import type { HorizontalSwipeDirection, HorizontalSwipeMotion } from './horizontal-swipe';

function isTextInputFocused() {
  const focusedInput = TextInput.State.currentlyFocusedInput?.();

  if (focusedInput !== undefined) return focusedInput !== null;
  if (typeof document === 'undefined') return false;

  return document.activeElement?.tagName === 'INPUT'
    || document.activeElement?.tagName === 'TEXTAREA';
}

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
      const handleEnd = (motion: HorizontalSwipeMotion, success: boolean) => {
        if (!success || isTextInputFocused()) return;

        const direction = resolveHorizontalSwipeDirection(motion);
        if (direction) onSwipe(direction);
      };

      const leftPan = Gesture.Pan()
        .enabled(enabled)
        .activeOffsetX(-HORIZONTAL_SWIPE_DISTANCE_CAPTURE_OFFSET_PT)
        .minVelocityX(-HORIZONTAL_SWIPE_FLICK_VELOCITY_THRESHOLD_PT_PER_SECOND)
        .failOffsetY([
          -HORIZONTAL_SWIPE_DISTANCE_THRESHOLD_PT,
          HORIZONTAL_SWIPE_DISTANCE_THRESHOLD_PT,
        ])
        .cancelsTouchesInView(false)
        .runOnJS(true)
        .onEnd(handleEnd);

      const rightPan = Gesture.Pan()
        .enabled(enabled)
        .activeOffsetX(HORIZONTAL_SWIPE_DISTANCE_CAPTURE_OFFSET_PT)
        .minVelocityX(HORIZONTAL_SWIPE_FLICK_VELOCITY_THRESHOLD_PT_PER_SECOND)
        .failOffsetY([
          -HORIZONTAL_SWIPE_DISTANCE_THRESHOLD_PT,
          HORIZONTAL_SWIPE_DISTANCE_THRESHOLD_PT,
        ])
        .cancelsTouchesInView(false)
        .runOnJS(true)
        .onEnd(handleEnd);

      return Gesture.Race(leftPan, rightPan);
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
