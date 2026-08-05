import { YStack, styled } from 'tamagui';

import { LoopingMarquee } from '../motion/looping-marquee';
import { MonoText } from './typography';

export type TerminalMarqueeTone = 'accent' | 'danger' | 'default' | 'success' | 'warning';

export type TerminalMarqueeItem = {
  id: string;
  label: string;
  tone?: TerminalMarqueeTone;
};

export type TerminalMarqueeProps = {
  items: readonly TerminalMarqueeItem[];
};

const TerminalMarqueeMessage = styled(MonoText, {
  name: 'TerminalMarqueeMessage',
  px: '$3.5',
  size: '$1',

  variants: {
    tone: {
      accent: { color: '$appAccent' },
      danger: { color: '$appDanger' },
      default: { color: '$appMuted' },
      success: { color: '$appSuccess' },
      warning: { color: '$appWarning' },
    },
  } as const,

  defaultVariants: {
    tone: 'default',
  },
});

export function TerminalMarquee({ items }: TerminalMarqueeProps) {
  if (items.length === 0) return null;

  return (
    <YStack
      mt="$2"
      py="$1.5"
      borderTopWidth={1}
      borderBottomWidth={1}
      borderColor="$appBorder"
      bg="$appSurfaceRaised"
      overflow="hidden"
      $md={{ mt: '$0' }}
    >
      <LoopingMarquee>
        {items.map((item) => (
          <TerminalMarqueeMessage key={item.id} tone={item.tone} numberOfLines={1}>
            {item.label}
          </TerminalMarqueeMessage>
        ))}
      </LoopingMarquee>
    </YStack>
  );
}
