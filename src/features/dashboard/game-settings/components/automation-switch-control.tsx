import { useEffect } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Switch, XStack, YStack, getTokens, useMedia } from 'tamagui';

import { MonoText } from '@/components';

export type AutomationSwitchControlProps = {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onCheckedChange?: (checked: boolean) => void;
  pending?: boolean;
  statusLabel?: string;
  testID: string;
};

const SWITCH_HEIGHT = {
  large: 26,
  small: 18,
} as const;
const LOADING_GLOW_INSET = 3;
const LOADING_PULSE_DURATION_MS = 700;

export function AutomationSwitchControl({
  checked,
  disabled = false,
  label,
  onCheckedChange,
  pending = false,
  statusLabel,
  testID,
}: AutomationSwitchControlProps) {
  const colors = getTokens().color;
  const { large } = useMedia();
  const reducedMotion = useReducedMotion();
  const loadingProgress = useSharedValue(0);
  const switchHeight = large ? SWITCH_HEIGHT.large : SWITCH_HEIGHT.small;
  const switchWidth = switchHeight * 2;

  useEffect(() => {
    cancelAnimation(loadingProgress);

    if (!pending) {
      loadingProgress.set(0);
      return;
    }

    if (reducedMotion) {
      loadingProgress.set(0.5);
      return;
    }

    loadingProgress.set(0);
    loadingProgress.set(withRepeat(
      withTiming(1, {
        duration: LOADING_PULSE_DURATION_MS,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    ));

    return () => cancelAnimation(loadingProgress);
  }, [loadingProgress, pending, reducedMotion]);

  const loadingGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(loadingProgress.value, [0, 1], [0.28, 0.72]),
    transform: [{
      scale: interpolate(loadingProgress.value, [0, 1], [0.98, 1.1]),
    }],
  }));

  return (
    <XStack items="center" gap="$1.5" shrink={0}>
      {statusLabel ? (
        <MonoText size="$1" color="$appWarning" fontWeight="700">
          {statusLabel}
        </MonoText>
      ) : null}
      <YStack
        width={switchWidth}
        height={switchHeight}
        items="center"
        justify="center"
        position="relative"
      >
        {pending ? (
          <Animated.View
            style={[
              {
                position: 'absolute',
                pointerEvents: 'none',
                width: switchWidth + LOADING_GLOW_INSET * 2,
                height: switchHeight + LOADING_GLOW_INSET * 2,
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
    </XStack>
  );
}
