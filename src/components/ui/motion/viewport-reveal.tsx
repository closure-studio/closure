import type { PropsWithChildren } from 'react';
import type { LayoutChangeEvent, ScrollView as NativeScrollView, View as NativeView } from 'react-native';
import Animated, {
  Easing,
  measure,
  type AnimatedRef,
  type SharedValue,
  useAnimatedRef,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

export type ScrollViewportMetrics = {
  height: SharedValue<number>;
  offset: SharedValue<number>;
  ref: AnimatedRef<NativeScrollView>;
};

type ViewportRevealProps = PropsWithChildren<{
  amount?: number;
  delay?: number;
  viewport: ScrollViewportMetrics;
  x?: number;
  y?: number;
}>;

export type ViewportVisibilityState = 'hidden' | 'unavailable' | 'visible';
export type ViewportRevealAction = 'animate' | 'mark-initial-hidden' | 'none' | 'show-immediately';

const REVEAL_DURATION_MS = 550;

export function getViewportVisibilityState({
  amount,
  itemHeight,
  itemTop,
  viewportHeight,
  viewportTop,
}: {
  amount: number;
  itemHeight: number;
  itemTop: number;
  viewportHeight: number;
  viewportTop: number;
}): ViewportVisibilityState {
  'worklet';

  if (itemHeight <= 0 || viewportHeight <= 0) return 'unavailable';

  const itemBottom = itemTop + itemHeight;
  const viewportBottom = viewportTop + viewportHeight;
  const visibleHeight = Math.max(
    0,
    Math.min(itemBottom, viewportBottom) - Math.max(itemTop, viewportTop),
  );

  return visibleHeight / itemHeight >= amount ? 'visible' : 'hidden';
}

export function getViewportRevealAction({
  hasCompletedInitialCheck,
  hasRevealed,
  visibility,
}: {
  hasCompletedInitialCheck: boolean;
  hasRevealed: boolean;
  visibility: ViewportVisibilityState;
}): ViewportRevealAction {
  'worklet';

  if (visibility === 'unavailable' || hasRevealed) return 'none';
  if (!hasCompletedInitialCheck) {
    return visibility === 'visible' ? 'show-immediately' : 'mark-initial-hidden';
  }

  return visibility === 'visible' ? 'animate' : 'none';
}

export function ViewportReveal({
  amount = 0.35,
  children,
  delay = 0,
  viewport,
  x = 0,
  y = 0,
}: ViewportRevealProps) {
  const reducedMotion = useReducedMotion();
  const itemRef = useAnimatedRef<NativeView>();
  const itemHeight = useSharedValue(0);
  const hasCompletedInitialCheck = useSharedValue(reducedMotion);
  const hasRevealed = useSharedValue(reducedMotion);
  const revealProgress = useSharedValue(reducedMotion ? 1 : 0);

  useAnimatedReaction(
    () => {
      if (reducedMotion || itemHeight.get() <= 0 || viewport.height.get() <= 0) {
        return 'unavailable' as const;
      }

      if (!Number.isFinite(viewport.offset.get())) return 'unavailable' as const;

      const itemMeasurement = measure(itemRef);
      const viewportMeasurement = measure(viewport.ref);
      if (itemMeasurement === null || viewportMeasurement === null) {
        return 'unavailable' as const;
      }

      return getViewportVisibilityState({
        amount,
        itemHeight: itemMeasurement.height,
        itemTop: itemMeasurement.pageY,
        viewportHeight: viewportMeasurement.height,
        viewportTop: viewportMeasurement.pageY,
      });
    },
    (visibility) => {
      const action = getViewportRevealAction({
        hasCompletedInitialCheck: hasCompletedInitialCheck.get(),
        hasRevealed: hasRevealed.get(),
        visibility,
      });

      if (action === 'none') return;

      hasCompletedInitialCheck.set(true);
      if (action === 'mark-initial-hidden') return;

      hasRevealed.set(true);
      if (action === 'show-immediately') {
        revealProgress.set(1);
        return;
      }

      revealProgress.set(withDelay(
        delay,
        withTiming(1, {
          duration: REVEAL_DURATION_MS,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      ));
    },
    [amount, delay, reducedMotion],
  );

  const revealStyle = useAnimatedStyle(() => ({
    opacity: revealProgress.get(),
    transform: [
      { translateX: x * (1 - revealProgress.get()) },
      { translateY: y * (1 - revealProgress.get()) },
    ],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    itemHeight.set(event.nativeEvent.layout.height);
  };

  return (
    <Animated.View ref={itemRef} collapsable={false} onLayout={handleLayout} style={revealStyle}>
      {children}
    </Animated.View>
  );
}
