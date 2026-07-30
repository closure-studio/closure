import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export function FlickeringStatusIndicator({ color }: { color: string }) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(1);
  const indicatorStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    cancelAnimation(opacity);
    opacity.set(1);
    if (!reducedMotion) {
      opacity.set(withRepeat(
        withSequence(
          withTiming(1, { duration: 5520 }),
          withTiming(0.4, { duration: 120 }),
          withTiming(1, { duration: 120 }),
          withTiming(0.7, { duration: 60 }),
          withTiming(1, { duration: 180 }),
        ),
        -1,
        false,
      ));
    }
    return () => cancelAnimation(opacity);
  }, [opacity, reducedMotion]);

  return <Animated.View style={[{ width: 6, height: 6, borderRadius: 999, backgroundColor: color }, indicatorStyle]} />;
}
