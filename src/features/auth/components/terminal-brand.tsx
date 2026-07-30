import type { ReactNode } from 'react';
import { XStack, YStack, getTokens, useMedia } from 'tamagui';

import { MonoText, NotchedFrame, TerminalText } from '@/components';

type TerminalBrandProps = Omit<React.ComponentProps<typeof XStack>, 'children' | 'scale'> & {
  mark?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  scale?: 'compact' | 'large' | 'responsive';
};

export function TerminalBrand({
  mark = 'C',
  title = '可露希尔工作室',
  subtitle = 'Closure · Studio',
  scale = 'responsive',
  ...props
}: TerminalBrandProps) {
  const colors = getTokens().color;
  const media = useMedia();
  const large = scale === 'large' || (scale === 'responsive' && media.md);

  return (
    <XStack items="center" gap="$3" {...props}>
      <NotchedFrame
        size={large ? 64 : 48}
        notch={8}
        fill={colors.terminalCyanSoft.val}
        stroke={colors.terminalCyanEdge.val}
        bracketColor={colors.terminalCyanRing.val}
      >
        <TerminalText
          size={large ? '$7' : '$5'}
          fontWeight="900"
          letterSpacing={large ? -1.4 : -0.9}
          color="$terminalCyan"
        >
          {mark}
        </TerminalText>
      </NotchedFrame>
      <YStack minW={0} shrink={1} gap="$0.5">
        <TerminalText size={large ? '$7' : '$5.5'} fontWeight="800" letterSpacing={3.6} shrink={1}>
          {title}
        </TerminalText>
        <MonoText size={large ? '$2' : '$1'} textTransform="uppercase" letterSpacing={large ? 2.75 : 2.5} shrink={1}>
          {subtitle}
        </MonoText>
      </YStack>
    </XStack>
  );
}
