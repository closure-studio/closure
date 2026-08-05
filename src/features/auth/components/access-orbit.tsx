import { useEffect } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';
import { YStack, getTokens, useMedia } from 'tamagui';

import { MonoText, TerminalText } from '@/components';

const AMBIENT_ORBIT_DURATION_MS = 18_000;

export function AccessOrbit({ label, nodeId }: { label: string; nodeId: string }) {
  const colors = getTokens().color;
  const media = useMedia();
  const reducedMotion = useReducedMotion();
  const rotation = useSharedValue(0);
  const size = media.md ? 430 : 144;
  const center = size / 2;

  useEffect(() => {
    if (reducedMotion) {
      rotation.set(0);
      return;
    }

    rotation.set(withRepeat(withTiming(360, {
      duration: AMBIENT_ORBIT_DURATION_MS,
      easing: Easing.linear,
    }), -1, false));

    return () => cancelAnimation(rotation);
  }, [reducedMotion, rotation]);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <YStack
      position="absolute"
      width={size}
      height={size}
      items="center"
      justify="center"
      r={media.md ? -20 : -40}
      t={media.md ? -30 : -80}
      opacity={0.58}
      style={{ pointerEvents: 'none' }}
    >
      <Animated.View style={[{ position: 'absolute', width: size, height: size }, rotationStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ pointerEvents: 'none' }}>
          <G fill="none" stroke={colors.appAccent.val}>
            <Circle cx={center} cy={center} r={center - 2} strokeOpacity={0.12} strokeWidth={1} />
            <Circle cx={center} cy={center} r={center * 0.78} strokeDasharray="2 10" strokeOpacity={0.42} strokeWidth={1} />
            <Circle cx={center} cy={center} r={center * 0.58} strokeDasharray="52 18" strokeOpacity={0.28} strokeWidth={2} />
            <Path
              d={`M ${center * 0.3} ${center} A ${center * 0.7} ${center * 0.7} 0 0 1 ${center * 1.7} ${center}`}
              strokeOpacity={0.5}
              strokeWidth={1}
            />
            <Line x1={center} y1={0} x2={center} y2={26} strokeOpacity={0.75} strokeWidth={2} />
            <Line x1={center} y1={size - 26} x2={center} y2={size} strokeOpacity={0.35} strokeWidth={1} />
            <Line x1={0} y1={center} x2={26} y2={center} strokeOpacity={0.35} strokeWidth={1} />
            <Line x1={size - 26} y1={center} x2={size} y2={center} strokeOpacity={0.75} strokeWidth={2} />
          </G>
        </Svg>
      </Animated.View>

      <YStack position="absolute" width={size} height={size} items="center" justify="center" gap="$0.5">
        <TerminalText size={media.md ? '$10' : '$6'} fontWeight="900" color="$appText">
          {nodeId}
        </TerminalText>
        <MonoText display="none" size="$1" color="$appAccent" textTransform="uppercase" text="center" $md={{ display: 'flex' }}>
          {label}
        </MonoText>
      </YStack>
    </YStack>
  );
}
