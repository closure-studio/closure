import { useEffect, useId } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Pattern, Rect, Stop } from 'react-native-svg';
import { XStack, YStack, getTokens } from 'tamagui';

import { MonoText } from '@/components';

function TrainingSignal({
  clock,
  index,
  particle = false,
  reducedMotion,
  color,
}: {
  clock: SharedValue<number>;
  index: number;
  particle?: boolean;
  reducedMotion: boolean;
  color: string;
}) {
  const motion = useAnimatedStyle(() => {
    const phase = (clock.value * 2 + index / 3) % 1;
    return particle ? {
      opacity: reducedMotion ? 0 : Math.sin(phase * Math.PI) * 0.65,
      transform: [{ translateY: -phase * 48 }],
    } : {
      opacity: reducedMotion ? 0.8 : 0.35 + 0.65 * Math.sin(phase * Math.PI),
      transform: [{ scaleY: reducedMotion ? 1 : 0.45 + 0.55 * Math.sin(phase * Math.PI) }],
    };
  });

  return (
    <Animated.View style={[
      particle
        ? { position: 'absolute', bottom: 20, left: `${25 + index * 25}%`, width: 2, height: 7, backgroundColor: color }
        : { width: 3, height: 10, backgroundColor: color },
      motion,
    ]} />
  );
}

export function OperatorTrainingEffect({ label }: { label: string }) {
  const color = getTokens().color.appAccent.val;
  const id = useId().replace(/:/g, '');
  const reducedMotion = useReducedMotion();
  const clock = useSharedValue(0);
  const height = useSharedValue(0);

  useEffect(() => {
    clock.set(0);
    if (!reducedMotion) {
      clock.set(withRepeat(withTiming(1, { duration: 5000, easing: Easing.linear }), -1));
    }
    return () => cancelAnimation(clock);
  }, [clock, reducedMotion]);

  const scanMotion = useAnimatedStyle(() => ({
    opacity: reducedMotion ? 0 : 1,
    transform: [{ translateY: (1 - Math.cos(clock.value * Math.PI * 2)) / 2 * Math.max(0, height.value - 32) }],
  }));

  return (
    <YStack
      testID="operator-training-effect"
      position="absolute" t={0} r={0} b={0} l={0}
      style={{ pointerEvents: 'none' }} aria-hidden overflow="hidden"
    >
      <YStack
        position="absolute" t={0} r={0} b={0} width="55%"
        $large={{ width: '100%', opacity: 0.5 }}
        onLayout={(event) => height.set(event.nativeEvent.layout.height)}
      >
        <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
          <Defs>
            <Pattern id={`${id}-grid`} width={14} height={14} patternUnits="userSpaceOnUse">
              <Path d="M 14 0 H 0 V 14" fill="none" stroke={color} strokeWidth={0.5} />
            </Pattern>
            <LinearGradient id={`${id}-fade`} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={color} stopOpacity={0} />
              <Stop offset="1" stopColor={color} stopOpacity={0.08} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${id}-grid)`} opacity={0.12} />
          <Rect width="100%" height="100%" fill={`url(#${id}-fade)`} />
        </Svg>
        <Animated.View testID="operator-training-scan" style={[{ position: 'absolute', top: 0, left: 0, right: 0, height: 32 }, scanMotion]}>
          <Svg width="100%" height={32}>
            <Defs>
              <LinearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity={0} />
                <Stop offset="0.48" stopColor={color} stopOpacity={0.22} />
                <Stop offset="0.5" stopColor={color} stopOpacity={0.85} />
                <Stop offset="0.54" stopColor={color} stopOpacity={0.22} />
                <Stop offset="1" stopColor={color} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height={32} fill={`url(#${id}-beam)`} />
          </Svg>
        </Animated.View>
        {[0, 1, 2].map((index) => (
          <TrainingSignal key={index} clock={clock} index={index} color={color} particle reducedMotion={reducedMotion} />
        ))}
      </YStack>
      <XStack position="absolute" t="$2.5" l="$2.5" r="$2.5" height={16} items="center" gap="$1.5" $large={{ t: '$3', l: '$3', r: '$3' }}>
        <XStack gap="$1" items="center" height={10} shrink={0}>
          {[0, 1, 2].map((index) => (
            <TrainingSignal key={index} clock={clock} index={index} color={color} reducedMotion={reducedMotion} />
          ))}
        </XStack>
        <MonoText size="$1" color="$appAccent" numberOfLines={1} minW={0} shrink={1}>{label}</MonoText>
      </XStack>
    </YStack>
  );
}
