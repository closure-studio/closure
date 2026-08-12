import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { TextInput } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import {
  HORIZONTAL_SWIPE_THRESHOLD_PT,
  resolveHorizontalSwipeDirection,
} from './horizontal-swipe';
import type { HorizontalSwipeDirection } from './horizontal-swipe';

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
      const gesture = Gesture.Pan()
        .enabled(enabled)
        .activeOffsetX([-HORIZONTAL_SWIPE_THRESHOLD_PT, HORIZONTAL_SWIPE_THRESHOLD_PT])
        .failOffsetY([-HORIZONTAL_SWIPE_THRESHOLD_PT, HORIZONTAL_SWIPE_THRESHOLD_PT])
        .cancelsTouchesInView(false)
        .runOnJS(true);

      return gesture.onEnd(({ translationX, translationY }) => {
        if (isTextInputFocused()) return;

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
