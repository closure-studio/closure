import { memo, useState } from 'react';
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
import { useIsomorphicLayoutEffect, XStack, YStack, styled } from 'tamagui';

import { MonoText } from './typography';

const MARQUEE_LOOP_DURATION_MS = 22_000;
const MARQUEE_WIDTH_CHANGE_THRESHOLD_PX = 0.5;

export type TerminalMarqueeTone = 'accent' | 'danger' | 'default' | 'success' | 'warning';

export type TerminalMarqueeItem = {
  id: string;
  label: string;
  tone?: TerminalMarqueeTone;
};

export type TerminalMarqueeProps = {
  items: readonly TerminalMarqueeItem[];
};

const TerminalMarqueeMessage = styled(MonoText, {
  name: 'TerminalMarqueeMessage',
  px: '$3.5',
  size: '$1',

  variants: {
    tone: {
      accent: { color: '$appAccent' },
      danger: { color: '$appDanger' },
      default: { color: '$appMuted' },
      success: { color: '$appSuccess' },
      warning: { color: '$appWarning' },
    },
  } as const,

  defaultVariants: {
    tone: 'default',
  },
});

export const TerminalMarquee = memo(function TerminalMarquee({ items }: TerminalMarqueeProps) {
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

  if (items.length === 0) return null;

  const marqueeContent = items.map((item) => (
    <TerminalMarqueeMessage key={item.id} tone={item.tone} numberOfLines={1}>
      {item.label}
    </TerminalMarqueeMessage>
  ));

  return (
    <YStack
      mt="$2"
      py="$1.5"
      borderTopWidth={1}
      borderBottomWidth={1}
      borderColor="$appBorder"
      bg="$appSurfaceRaised"
      overflow="hidden"
      $md={{ mt: '$0' }}
    >
      <Animated.View style={[{ flexDirection: 'row', alignSelf: 'flex-start' }, marqueeStyle]}>
        <XStack onLayout={handleContentLayout} shrink={0}>
          {marqueeContent}
        </XStack>
        <XStack
          aria-hidden
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          shrink={0}
        >
          {marqueeContent}
        </XStack>
      </Animated.View>
    </YStack>
  );
});
