import { useEffect, useId } from 'react';
import type { ColorValue } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Mask, Path, Pattern, Rect, Stop } from 'react-native-svg';
import { YStack, getTokens } from 'tamagui';

type ToastBackdropProps = {
  scanColor: string;
  scanDurationMs: number;
  washColor: ColorValue;
  washOpacity: number;
};

const SCAN_BEAM_WIDTH_PX = 64;

export function ToastBackdrop({
  scanColor,
  scanDurationMs,
  washColor,
  washOpacity,
}: ToastBackdropProps) {
  const id = useId().replace(/:/g, '');
  const gridColor = getTokens().color.appText.val;
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(0);
    if (reducedMotion) return;

    const scan = withTiming(1, { duration: scanDurationMs, easing: Easing.linear });
    progress.set(scan);

    return () => cancelAnimation(progress);
  }, [progress, reducedMotion, scanDurationMs]);

  const scanStyle = useAnimatedStyle(() => ({
    opacity: reducedMotion ? 0 : Math.sin(progress.value * Math.PI) * 0.1,
    left: `${progress.value * 100}%`,
    transform: [{ translateX: -SCAN_BEAM_WIDTH_PX * (1 - progress.value) }],
  }));

  return (
    <YStack
      position="absolute" t={0} r={0} b={0} l={0}
      overflow="hidden" aria-hidden style={{ pointerEvents: 'none' }}
    >
      <YStack
        testID="app-toast-wash"
        position="absolute" t={0} r={0} b={0} l={0}
        opacity={washOpacity}
        style={{ backgroundColor: washColor }}
      />
      <YStack
        position="absolute" t={0} r={0} b={0} width={128} maxW="40%"
      >
        <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
          <Defs>
            <Pattern id={`${id}-grid`} width={14} height={14} patternUnits="userSpaceOnUse">
              <Path d="M 14 0 H 0 V 14" fill="none" stroke={gridColor} strokeWidth={0.5} />
            </Pattern>
            <LinearGradient id={`${id}-fade`} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="white" stopOpacity={0} />
              <Stop offset="1" stopColor="white" stopOpacity={1} />
            </LinearGradient>
            <Mask id={`${id}-mask`}>
              <Rect width="100%" height="100%" fill={`url(#${id}-fade)`} />
            </Mask>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${id}-grid)`} mask={`url(#${id}-mask)`} opacity={0.025} />
        </Svg>
      </YStack>
      <Animated.View
        testID="app-toast-scan"
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: SCAN_BEAM_WIDTH_PX,
          },
          scanStyle,
        ]}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={`${id}-scan`} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={scanColor} stopOpacity={0} />
              <Stop offset="0.5" stopColor={scanColor} stopOpacity={1} />
              <Stop offset="1" stopColor={scanColor} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${id}-scan)`} />
        </Svg>
      </Animated.View>
    </YStack>
  );
}
