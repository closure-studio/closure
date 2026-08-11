import type { ReactNode } from 'react';
import { XStack, YStack, getTokens } from 'tamagui';

import { MonoText, NotchedSurface, TerminalText } from '@/components';
import { useUiSettings } from '@/providers/ui-settings-provider';

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
  const { layoutSize } = useUiSettings();
  const large = scale === 'large' || (scale === 'responsive' && layoutSize === 'large');

  return (
    <XStack items="center" gap="$3" {...props}>
      <YStack
        position="relative"
        width={large ? '$6' : '$4.5'}
        height={large ? '$6' : '$4.5'}
        items="center"
        justify="center"
      >
        <NotchedSurface
          notch={8}
          fill={colors.appAccentSoft.val}
          stroke={colors.appAccentEdge.val}
          bracketColor={colors.appAccentRing.val}
        />
        <TerminalText
          size={large ? '$7' : '$5'}
          fontWeight="900"
          letterSpacing={large ? -1.4 : -0.9}
          color="$appAccent"
        >
          {mark}
        </TerminalText>
      </YStack>
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
