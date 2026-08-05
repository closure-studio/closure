import { Check } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import {
  Easing,
  cancelAnimation,
  createAnimatedComponent,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Checkbox, Label, XStack, YStack, getTokens, styled } from 'tamagui';

import { MonoText } from './typography';

const AnimatedView = createAnimatedComponent(View);

export type TerminalCheckboxProps = {
  checked: boolean;
  disabled?: boolean;
  id: string;
  label: string;
  onCheckedChange: (checked: boolean) => void;
};

const checkboxDimension = 28;
const dataPulseScale = 1.35;
const animationDurationMs = {
  check: 130,
  circuitIn: 70,
  circuitOut: 90,
  pulseDelay: 100,
  pulseIn: 60,
  pulseOut: 120,
} as const;

const TerminalCheckboxFrame = styled(Checkbox, {
  name: 'TerminalCheckboxFrame',
  size: '$2',
  hitSlop: 10,
  rounded: '$0',
  focusVisibleStyle: { borderColor: '$appText' },

  variants: {
    selected: {
      true: { borderColor: '$appAccent', bg: '$appAccentSoft' },
      false: { borderColor: '$appBorder', bg: 'transparent' },
    },
  } as const,
});

const TerminalCheckboxLabel = styled(Label, {
  name: 'TerminalCheckboxLabel',
  unstyled: true,
  cursor: 'pointer',
  pressStyle: { opacity: 0.7 },

  variants: {
    disabled: {
      true: { cursor: 'not-allowed' },
      false: {},
    },
  } as const,
});

export function TerminalCheckbox({ checked, disabled = false, id, label, onCheckedChange }: TerminalCheckboxProps) {
  const colors = getTokens().color;
  const reducedMotion = useReducedMotion();
  const previousChecked = useRef(checked);
  const checkProgress = useSharedValue(checked ? 1 : 0);
  const circuitProgress = useSharedValue(0);
  const pulseProgress = useSharedValue(0);

  useEffect(() => {
    const didCheckedChange = previousChecked.current !== checked;
    previousChecked.current = checked;
    cancelAnimation(checkProgress);
    cancelAnimation(circuitProgress);
    cancelAnimation(pulseProgress);

    if (!didCheckedChange || reducedMotion) {
      checkProgress.set(Number(checked));
      circuitProgress.set(0);
      pulseProgress.set(0);
    } else if (checked) {
      circuitProgress.set(withSequence(
        withTiming(1, { duration: animationDurationMs.circuitIn, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: animationDurationMs.circuitOut }),
      ));
      checkProgress.set(withDelay(
        animationDurationMs.circuitIn,
        withTiming(1, { duration: animationDurationMs.check, easing: Easing.out(Easing.cubic) }),
      ));
      pulseProgress.set(withDelay(
        animationDurationMs.pulseDelay,
        withSequence(
          withTiming(1, { duration: animationDurationMs.pulseIn, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: animationDurationMs.pulseOut }),
        ),
      ));
    } else {
      checkProgress.set(withTiming(0, { duration: animationDurationMs.check }));
      circuitProgress.set(withSequence(
        withTiming(0.65, { duration: animationDurationMs.circuitIn }),
        withTiming(0, { duration: animationDurationMs.circuitOut }),
      ));
      pulseProgress.set(0);
    }

    return () => {
      cancelAnimation(checkProgress);
      cancelAnimation(circuitProgress);
      cancelAnimation(pulseProgress);
    };
  }, [checkProgress, checked, circuitProgress, pulseProgress, reducedMotion]);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkProgress.value,
    transform: [{ scale: 0.6 + checkProgress.value * 0.4 }],
  }));
  const circuitStyle = useAnimatedStyle(() => ({
    opacity: circuitProgress.value,
    transform: [{ scale: 0.35 + circuitProgress.value * 0.65 }],
  }));
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseProgress.value * 0.65,
    transform: [{ scale: 1 + pulseProgress.value * (dataPulseScale - 1) }],
  }));

  return (
    <XStack minH="$4.5" px="$1" items="center" gap="$2" opacity={disabled ? 0.55 : 1}>
      <YStack position="relative" width={checkboxDimension} height={checkboxDimension} items="center" justify="center">
        <AnimatedView
          style={[
            {
              position: 'absolute',
              pointerEvents: 'none',
              width: checkboxDimension,
              height: checkboxDimension,
              borderWidth: 1,
              borderColor: colors.appAccent.val,
            },
            pulseStyle,
          ]}
        />
        <TerminalCheckboxFrame
          id={id}
          accessible
          aria-label={label}
          selected={checked}
          checked={checked}
          disabled={disabled}
          onCheckedChange={(nextChecked) => onCheckedChange(nextChecked === true)}
        >
          <AnimatedView
            style={[
              {
                position: 'absolute',
                pointerEvents: 'none',
                width: checkboxDimension,
                height: checkboxDimension,
                alignItems: 'center',
                justifyContent: 'center',
              },
              circuitStyle,
            ]}
          >
            <YStack position="absolute" l={-3} t={10} width={2} height={8} bg="$appAccent" />
            <YStack position="absolute" r={-3} t={10} width={2} height={8} bg="$appAccent" />
            <YStack position="absolute" width={11} height={1} bg="$appAccent" />
            <YStack position="absolute" width={1} height={11} bg="$appAccent" />
            <YStack position="absolute" width={3} height={3} bg="$appAccent" />
          </AnimatedView>
          <Checkbox.Indicator forceMount>
            <AnimatedView style={checkStyle}>
              <Check size={14} strokeWidth={2.5} color={colors.appAccent.val} />
            </AnimatedView>
          </Checkbox.Indicator>
        </TerminalCheckboxFrame>
      </YStack>
      <TerminalCheckboxLabel htmlFor={id} disabled={disabled}>
        <MonoText size="$3">{label}</MonoText>
      </TerminalCheckboxLabel>
    </XStack>
  );
}
