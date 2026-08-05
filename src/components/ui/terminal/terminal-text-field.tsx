import { Eye, EyeOff, type LucideIcon } from 'lucide-react-native';
import type { ComponentProps, ComponentRef, ReactNode } from 'react';
import { forwardRef, useId } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { AnimatePresence, Button, Input, Label, XStack, YStack, getTokens, styled } from 'tamagui';

import { MonoText } from './typography';

const TerminalTextInput = styled(Input, {
  name: 'TerminalTextInput',
  unstyled: true,
  grow: 1,
  shrink: 1,
  height: '100%',
  minW: 0,
  p: 0,
  rounded: '$0',
  bg: 'transparent',
  color: '$appText',
  fontSize: '$3',
  focusStyle: { borderWidth: 0 },
  focusVisibleStyle: { outlineWidth: 0, outlineStyle: 'none' },
});

const TerminalTextFieldFrame = styled(XStack, {
  name: 'TerminalTextFieldFrame',
  height: '$4.5',
  px: '$3',
  items: 'center',
  gap: '$2',
  borderWidth: 1,
  borderColor: '$appBorder',

  variants: {
    surface: {
      solid: {
        bg: '$appSurfaceRaised',
        focusWithinStyle: { borderColor: '$appAccent' },
      },
      translucent: {
        bg: '$appSurfaceRaisedTranslucent',
        focusWithinStyle: { borderColor: '$appAccentBorder' },
      },
    },
    invalid: {
      true: {
        bg: '$appWarningSoft',
        borderColor: '$appWarning',
        focusWithinStyle: { borderColor: '$appWarning' },
      },
    },
  } as const,
});

type TerminalInputProps = ComponentProps<typeof TerminalTextInput>;

type TerminalTextFieldProps = {
  autoComplete?: TerminalInputProps['autoComplete'];
  enterKeyHint?: TerminalInputProps['enterKeyHint'];
  error?: string;
  icon: LucideIcon;
  keyboardType?: TerminalInputProps['keyboardType'];
  label: string;
  onBlur?: TerminalInputProps['onBlur'];
  onChangeText: (value: string) => void;
  onFocus?: TerminalInputProps['onFocus'];
  onSubmitEditing?: TerminalInputProps['onSubmitEditing'];
  placeholder: string;
  returnKeyType?: TerminalInputProps['returnKeyType'];
  secureTextEntry?: boolean;
  submitBehavior?: TerminalInputProps['submitBehavior'];
  surface?: 'solid' | 'translucent';
  trailing?: ReactNode;
  value: string;
};

export type TerminalTextFieldHandle = ComponentRef<typeof Input>;

export const TerminalTextField = forwardRef<TerminalTextFieldHandle, TerminalTextFieldProps>(function TerminalTextField({
  autoComplete,
  enterKeyHint,
  error,
  icon: Icon,
  keyboardType,
  label,
  onBlur,
  onChangeText,
  onFocus,
  onSubmitEditing,
  placeholder,
  returnKeyType,
  secureTextEntry,
  submitBehavior,
  surface = 'solid',
  trailing,
  value,
}, ref) {
  const id = useId();
  const errorId = `${id}-error`;
  const colors = getTokens().color;
  const reducedMotion = useReducedMotion();
  const optionalInputProps = {
    ...(autoComplete === undefined ? {} : { autoComplete }),
    ...(enterKeyHint === undefined ? {} : { enterKeyHint }),
    ...(keyboardType === undefined ? {} : { keyboardType }),
    ...(onBlur === undefined ? {} : { onBlur }),
    ...(onFocus === undefined ? {} : { onFocus }),
    ...(onSubmitEditing === undefined ? {} : { onSubmitEditing }),
    ...(returnKeyType === undefined ? {} : { returnKeyType }),
    ...(secureTextEntry === undefined
      ? {}
      : { secureTextEntry, type: secureTextEntry ? 'password' : 'text' }),
    ...(submitBehavior === undefined ? {} : { submitBehavior }),
  } satisfies TerminalInputProps;

  return (
    <YStack gap="$1.5">
      <Label htmlFor={id}>
        <MonoText size="$2.5" textTransform="uppercase">{label}</MonoText>
      </Label>
      <TerminalTextFieldFrame surface={surface} invalid={Boolean(error)}>
        <Icon size={16} color={colors.appMuted.val} strokeWidth={1.7} />
        <TerminalTextInput
          ref={ref}
          id={id}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="$appMuted"
          autoCapitalize="none"
          autoCorrect={false}
          {...optionalInputProps}
          {...(error ? { 'aria-describedby': errorId } : {})}
          aria-invalid={Boolean(error)}
          fontFamily={surface === 'translucent' ? '$mono' : '$body'}
        />
        {trailing}
      </TerminalTextFieldFrame>
      <AnimatePresence>
        {error ? (
          <MonoText
            key={errorId}
            id={errorId}
            nativeID={errorId}
            size="$2.5"
            color="$appWarning"
            accessibilityLiveRegion="polite"
            aria-live="polite"
            transition={reducedMotion ? '0ms' : '200ms'}
            enterStyle={reducedMotion ? null : { opacity: 0, y: -2 }}
            exitStyle={reducedMotion ? null : { opacity: 0, y: -2 }}
          >
            {`// ${error}`}
          </MonoText>
        ) : null}
      </AnimatePresence>
    </YStack>
  );
});

export function TerminalPasswordVisibilityButton({
  hideLabel,
  isPasswordVisible,
  onPress,
  showLabel,
}: {
  hideLabel: string;
  isPasswordVisible: boolean;
  onPress: () => void;
  showLabel: string;
}) {
  const colors = getTokens().color;
  return (
    <Button
      unstyled
      minW="$4.5"
      minH="$4.5"
      p={0}
      items="center"
      justify="center"
      borderWidth={1}
      borderColor="transparent"
      rounded="$0"
      pressStyle={{ bg: '$appAccentSoft' }}
      focusVisibleStyle={{ borderColor: '$appAccent' }}
      onPress={onPress}
      aria-label={isPasswordVisible ? hideLabel : showLabel}
    >
      {isPasswordVisible
        ? <EyeOff size={16} color={colors.appMuted.val} />
        : <Eye size={16} color={colors.appMuted.val} />}
    </Button>
  );
}
