import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Switch, YStack, getTokens, useMedia } from 'tamagui';

type AutomationSwitchControlProps = {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onCheckedChange?: (checked: boolean) => void;
  pending?: boolean;
  testID: string;
};

const LOADING_GLOW_INSET = 3;
const LOADING_PULSE_DURATION_MS = 700;

export function AutomationSwitchControl({
  checked,
  disabled = false,
  label,
  onCheckedChange,
  pending = false,
  testID,
}: AutomationSwitchControlProps) {
  const colors = getTokens().color;
  const { large } = useMedia();
  const reducedMotion = useReducedMotion();
  const loadingProgress = useDerivedValue(() => {
    if (!pending) return 0;
    if (reducedMotion) return 0.5;
    return withRepeat(
      withTiming(1, {
        duration: LOADING_PULSE_DURATION_MS,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
  }, [pending, reducedMotion]);

  const loadingGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(loadingProgress.value, [0, 1], [0.28, 0.72]),
    transform: [{
      scale: interpolate(loadingProgress.value, [0, 1], [0.98, 1.1]),
    }],
  }));

  return (
    <YStack position="relative" shrink={0}>
      {pending ? (
        <Animated.View
          style={[
            {
              position: 'absolute',
              pointerEvents: 'none',
              top: -LOADING_GLOW_INSET,
              right: -LOADING_GLOW_INSET,
              bottom: -LOADING_GLOW_INSET,
              left: -LOADING_GLOW_INSET,
              borderRadius: 999,
              backgroundColor: colors.appAccentSoft.val,
              borderWidth: 1,
              borderColor: colors.appAccentRing.val,
            },
            loadingGlowStyle,
          ]}
        />
      ) : null}
      <Switch
        testID={testID}
        aria-label={label}
        aria-busy={pending}
        aria-disabled={disabled}
        checked={checked}
        disabled={disabled}
        size={large ? '$3.5' : '$2'}
        bg={checked ? '$appAccentSoft' : '$appSurface'}
        borderWidth={1}
        borderColor={checked ? '$appAccentBorder' : '$appBorder'}
        {...(onCheckedChange ? { onCheckedChange } : {})}
      >
        <Switch.Thumb bg={checked ? '$appAccent' : '$appMuted'} />
      </Switch>
    </YStack>
  );
}
