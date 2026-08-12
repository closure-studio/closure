import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import type { ReactElement } from 'react';
import { TextInput } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { YStack } from 'tamagui';

import { PAGE_TRANSITION_TIMING } from '@/constants/page-transition';
import {
  HORIZONTAL_SWIPE_DISTANCE_CAPTURE_OFFSET_PT,
  HORIZONTAL_SWIPE_DISTANCE_THRESHOLD_PT,
  resolveHorizontalSwipeBoundaryProgress,
  resolveHorizontalSwipeDirection,
  resolveHorizontalSwipeProgress,
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
  canSwipeLeft,
  canSwipeRight,
  children,
  contentKey,
  enabled,
  onSwipe,
}: {
  canSwipeLeft: boolean;
  canSwipeRight: boolean;
  children: ReactElement;
  contentKey: string;
  enabled: boolean;
  onSwipe: (direction: HorizontalSwipeDirection) => void;
}) {
  const reducedMotion = useReducedMotion();
  const previousContentKey = useRef(contentKey);
  const progress = useSharedValue(0);
  const contentWidth = useSharedValue(0);
  const lockedDirection = useSharedValue<HorizontalSwipeDirection | null>(null);
  const cancelled = useSharedValue(false);
  const restore = useCallback(() => {
    progress.set(withTiming(0, {
      duration: reducedMotion ? 75 : PAGE_TRANSITION_TIMING.phaseMs,
      easing: Easing.inOut(Easing.ease),
    }));
  }, [progress, reducedMotion]);
  const dismiss = useCallback((direction: HorizontalSwipeDirection) => {
    progress.set(withTiming(1, {
      duration: reducedMotion ? 75 : PAGE_TRANSITION_TIMING.phaseMs,
      easing: Easing.inOut(Easing.ease),
    }, (finished) => {
      if (finished) scheduleOnRN(onSwipe, direction);
    }));
  }, [onSwipe, progress, reducedMotion]);

  useLayoutEffect(() => {
    if (previousContentKey.current === contentKey) return;

    previousContentKey.current = contentKey;
    progress.set(1);
    progress.set(withTiming(0, {
      duration: reducedMotion ? 75 : PAGE_TRANSITION_TIMING.phaseMs,
      easing: Easing.inOut(Easing.ease),
    }));
  }, [contentKey, progress, reducedMotion]);

  const panGesture = useMemo(() => Gesture.Pan()
    .enabled(enabled)
    .activeOffsetX([
      -HORIZONTAL_SWIPE_DISTANCE_CAPTURE_OFFSET_PT,
      HORIZONTAL_SWIPE_DISTANCE_CAPTURE_OFFSET_PT,
    ])
    .failOffsetY([
      -HORIZONTAL_SWIPE_DISTANCE_THRESHOLD_PT,
      HORIZONTAL_SWIPE_DISTANCE_THRESHOLD_PT,
    ])
    .cancelsTouchesInView(true)
    .runOnJS(true)
    .onStart((motion) => {
      if (isTextInputFocused()) {
        cancelled.set(true);
        return;
      }

      const direction = motion.translationX < 0 ? 'left' : 'right';
      progress.set(0);
      lockedDirection.set(direction);
      cancelled.set(false);
    })
    .onUpdate((motion) => {
      const direction = lockedDirection.get();
      if (!direction || cancelled.get()) return;

      if ((direction === 'left' && motion.translationX >= 0)
        || (direction === 'right' && motion.translationX <= 0)) {
        cancelled.set(true);
        progress.set(0);
        return;
      }

      const hasTarget = direction === 'left' ? canSwipeLeft : canSwipeRight;
      progress.set(hasTarget
        ? resolveHorizontalSwipeProgress(motion.translationX, contentWidth.get())
        : resolveHorizontalSwipeBoundaryProgress(motion.translationX, contentWidth.get()));
    })
    .onEnd((motion: HorizontalSwipeMotion, success) => {
      const direction = lockedDirection.get();
      const resolvedDirection = resolveHorizontalSwipeDirection(motion);
      const hasTarget = direction === 'left' ? canSwipeLeft : canSwipeRight;

      if (!success || cancelled.get() || !direction || direction !== resolvedDirection || !hasTarget) {
        restore();
        return;
      }

      dismiss(direction);
    })
    .onFinalize((_motion, success) => {
      if (!success) restore();
      lockedDirection.set(null);
    }), [
    canSwipeLeft,
    canSwipeRight,
    cancelled,
    contentWidth,
    dismiss,
    enabled,
    lockedDirection,
    progress,
    restore,
  ]);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.get(),
    transform: [{ scale: reducedMotion ? 1 : 1 - progress.get() * 0.02 }],
  }));

  return (
    <GestureDetector gesture={panGesture} touchAction={enabled ? 'pan-y' : 'auto'}>
      <YStack
        grow={1}
        shrink={1}
        minW={0}
        minH={0}
        onLayout={(event) => contentWidth.set(event.nativeEvent.layout.width)}
      >
        <Animated.View style={[{ flex: 1, minHeight: 0 }, animatedStyle]}>
          {children}
        </Animated.View>
      </YStack>
    </GestureDetector>
  );
}
