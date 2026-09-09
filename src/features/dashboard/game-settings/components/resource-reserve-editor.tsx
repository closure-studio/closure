import { Check, Minus, Plus } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import {
  Button,
  Dialog,
  Form,
  Spinner,
  XStack,
  YStack,
  getTokens,
  useMedia,
} from 'tamagui';

import { MonoText, TerminalNotice, TerminalText } from '@/components';

const LONG_PRESS_DELAY_MS = 400;
const REPEAT_INTERVAL_MS = 100;

function useRepeatingPress(action: () => void) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didLongPressRef = useRef(false);

  const stopRepeating = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(
    () => () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    },
    [],
  );

  const onLongPress = () => {
    didLongPressRef.current = true;
    action();
    intervalRef.current = setInterval(action, REPEAT_INTERVAL_MS);
  };

  return {
    delayLongPress: LONG_PRESS_DELAY_MS,
    onLongPress,
    onPress: () => {
      if (!didLongPressRef.current) action();
    },
    onPressIn: () => {
      stopRepeating();
      didLongPressRef.current = false;
    },
    onPressOut: stopRepeating,
  };
}

export type ResourceReserveEditorProps = {
  cancelLabel: string;
  decreaseLabel: string;
  description: string;
  error: string | null;
  increaseLabel: string;
  initialValue: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onDecrease: () => void;
  onIncrease: () => void;
  onSubmit: () => void;
  saveLabel: string;
  testID: string;
  title: string;
  unit: string;
  value: number;
};

export function ResourceReserveEditor({
  cancelLabel,
  decreaseLabel,
  description,
  error,
  increaseLabel,
  initialValue,
  isSubmitting,
  onCancel,
  onDecrease,
  onIncrease,
  onSubmit,
  saveLabel,
  testID,
  title,
  unit,
  value,
}: ResourceReserveEditorProps) {
  const colors = getTokens().color;
  const { large } = useMedia();
  const hasChanges = value !== initialValue;
  const decreasePress = useRepeatingPress(onDecrease);
  const increasePress = useRepeatingPress(onIncrease);

  return (
    <Form onSubmit={onSubmit} gap="$4">
      <YStack gap="$2">
        <Dialog.Title asChild>
          <TerminalText size={large ? '$5' : '$5.5'} fontWeight="800" numberOfLines={2}>
            {title}
          </TerminalText>
        </Dialog.Title>
        <Dialog.Description asChild>
          <MonoText size={large ? '$2' : '$2.5'} color="$appMuted">
            {description}
          </MonoText>
        </Dialog.Description>
      </YStack>

      <XStack
        minH={56}
        maxH={56}
        minW={0}
        items="stretch"
        overflow="hidden"
        bg="$appSurfaceRaised"
        borderWidth={1}
        borderColor="$appBorder"
      >
        <Button
          testID="numeric-step-decrease"
          aria-label={decreaseLabel}
          unstyled
          minW={56}
          maxW={56}
          minH={56}
          maxH={56}
          p="$0"
          items="center"
          justify="center"
          shrink={0}
          opacity={value === 0 || isSubmitting ? 0.35 : 1}
          hoverStyle={{ bg: '$appAccentSoft' }}
          pressStyle={{ bg: '$appAccentSoft' }}
          disabled={value === 0 || isSubmitting}
          {...decreasePress}
        >
          <Minus size={18} color={colors.appAccent.val} />
        </Button>

        <XStack
          testID={testID}
          grow={1}
          minW={0}
          items="center"
          justify="center"
          gap="$1.5"
          borderLeftWidth={1}
          borderRightWidth={1}
          borderColor="$appBorder"
        >
          <TerminalText
            size={large ? '$6' : '$7'}
            fontWeight="800"
            color="$appText"
            fontVariant={['tabular-nums']}
          >
            {value}
          </TerminalText>
          <MonoText size={large ? '$1' : '$2'} color="$appMuted">
            {unit}
          </MonoText>
        </XStack>

        <Button
          testID="numeric-step-increase"
          aria-label={increaseLabel}
          unstyled
          minW={56}
          maxW={56}
          minH={56}
          maxH={56}
          p="$0"
          items="center"
          justify="center"
          shrink={0}
          hoverStyle={{ bg: '$appAccentSoft' }}
          pressStyle={{ bg: '$appAccentSoft' }}
          disabled={isSubmitting}
          {...increasePress}
        >
          <Plus size={18} color={colors.appAccent.val} />
        </Button>
      </XStack>

      {error ? <TerminalNotice tone="danger">{error}</TerminalNotice> : null}

      <XStack items="center" justify="flex-end" gap="$2">
        <Button
          testID="hosting-config-dialog-cancel"
          unstyled
          minH="$4"
          items="center"
          justify="center"
          px="$3"
          py="$2"
          hoverStyle={{ bg: '$appSurfaceRaised' }}
          pressStyle={{ opacity: 0.7 }}
          disabled={isSubmitting}
          onPress={onCancel}
        >
          <MonoText size={large ? '$2' : '$2.5'}>{cancelLabel}</MonoText>
        </Button>

        <Form.Trigger asChild>
          <Button
            testID="hosting-config-submit"
            unstyled
            minH="$4"
            items="center"
            justify="center"
            px="$4"
            py="$2"
            borderWidth={1}
            borderColor="$appAccent"
            bg="$appAccentSoft"
            opacity={!hasChanges || isSubmitting ? 0.4 : 1}
            hoverStyle={{ bg: '$appSurfaceRaised' }}
            pressStyle={{ opacity: 0.7 }}
            disabled={!hasChanges || isSubmitting}
          >
            <XStack items="center" justify="center" gap="$2">
              {isSubmitting ? (
                <Spinner size="small" color="$appAccent" />
              ) : (
                <Check size={14} color={colors.appAccent.val} />
              )}
              <MonoText
                size={large ? '$2' : '$2.5'}
                color="$appAccent"
                fontWeight="700"
              >
                {saveLabel}
              </MonoText>
            </XStack>
          </Button>
        </Form.Trigger>
      </XStack>
    </Form>
  );
}
