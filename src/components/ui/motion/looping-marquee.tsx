import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useIsomorphicLayoutEffect, XStack, YStack } from 'tamagui';

const MARQUEE_LOOP_DURATION_MS = 22_000;
const MARQUEE_WIDTH_CHANGE_THRESHOLD_PX = 0.5;

export function LoopingMarquee({ children }: PropsWithChildren) {
  const reducedMotion = useReducedMotion();
  const [contentWidth, setContentWidth] = useState(0);
  const horizontalOffset = useSharedValue(0);
  const marqueeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: horizontalOffset.get() }],
  }));

  useIsomorphicLayoutEffect(() => {
    cancelAnimation(horizontalOffset);

    if (reducedMotion || contentWidth <= 0) {
      horizontalOffset.set(0);

      return () => cancelAnimation(horizontalOffset);
    }

    const animationFrame = requestAnimationFrame(() => {
      horizontalOffset.set(0);
      horizontalOffset.set(
        withRepeat(
          withTiming(-contentWidth, {
            duration: MARQUEE_LOOP_DURATION_MS,
            easing: Easing.linear,
          }),
          -1,
          false,
        ),
      );
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      cancelAnimation(horizontalOffset);
    };
  }, [contentWidth, horizontalOffset, reducedMotion]);

  const handleContentLayout = (event: LayoutChangeEvent) => {
    const nextContentWidth = event.nativeEvent.layout.width;

    setContentWidth((currentContentWidth) =>
      Math.abs(currentContentWidth - nextContentWidth) < MARQUEE_WIDTH_CHANGE_THRESHOLD_PX
        ? currentContentWidth
        : nextContentWidth,
    );
  };

  return (
    <YStack overflow="hidden">
      <Animated.View style={[{ flexDirection: 'row', alignSelf: 'flex-start' }, marqueeStyle]}>
        <XStack onLayout={handleContentLayout} shrink={0}>
          {children}
        </XStack>
        <XStack
          aria-hidden
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          shrink={0}
        >
          {children}
        </XStack>
      </Animated.View>
    </YStack>
  );
}
