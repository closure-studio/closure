import type { ReactNode } from 'react';
import { Button, XStack, YStack, getTokens } from 'tamagui';

import { MonoText, NotchedSurface, TerminalText } from '@/components';

type TerminalBrandProps = Omit<React.ComponentProps<typeof XStack>, 'children'> & {
  mark?: ReactNode;
  markAccessibilityLabel?: string;
  onMarkPress?: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
};

export function TerminalBrand({
  mark = 'C',
  markAccessibilityLabel,
  onMarkPress,
  title = '可露希尔工作室',
  subtitle = 'Closure · Studio',
  ...props
}: TerminalBrandProps) {
  const colors = getTokens().color;
  const markContent = (
    <>
      <NotchedSurface
        notch={8}
        fill={colors.appAccentSoft.val}
        stroke={colors.appAccentEdge.val}
        bracketColor={colors.appAccentRing.val}
      />
      <TerminalText
        size="$5"
        fontWeight="900"
        letterSpacing={-0.9}
        color="$appAccent"
        $large={{ size: '$7', letterSpacing: -1.4 }}
      >
        {mark}
      </TerminalText>
    </>
  );

  return (
    <XStack items="center" gap="$3" {...props}>
      {onMarkPress ? (
        <Button
          unstyled
          position="relative"
          width="$4.5"
          height="$4.5"
          items="center"
          justify="center"
          $large={{ width: '$6', height: '$6' }}
          testID="terminal-brand-mark"
          aria-label={markAccessibilityLabel}
          onPress={onMarkPress}
          pressStyle={{ opacity: 0.72, scale: 0.96 }}
        >
          {markContent}
        </Button>
      ) : (
        <YStack
          position="relative"
          width="$4.5"
          height="$4.5"
          items="center"
          justify="center"
          $large={{ width: '$6', height: '$6' }}
        >
          {markContent}
        </YStack>
      )}
      <YStack minW={0} shrink={1} gap="$0.5">
        <TerminalText size="$5.5" fontWeight="800" letterSpacing={3.6} shrink={1} $large={{ size: '$7' }}>
          {title}
        </TerminalText>
        <MonoText size="$1" textTransform="uppercase" letterSpacing={2.5} shrink={1} $large={{ size: '$2', letterSpacing: 2.75 }}>
          {subtitle}
        </MonoText>
      </YStack>
    </XStack>
  );
}
