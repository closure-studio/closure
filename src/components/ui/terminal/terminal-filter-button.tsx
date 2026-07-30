import { Button, styled } from 'tamagui';

import { MonoText } from './typography';

const TerminalFilterButtonFrame = styled(Button, {
  name: 'TerminalFilterButton',
  unstyled: true,
  shrink: 0,
  px: 12,
  py: 6,
  rounded: '$0',
  borderWidth: 1,
  hoverStyle: { borderColor: '$terminalCyanBorder' },
  pressStyle: { opacity: 0.7 },
  '$platform-web': {
    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
  },

  variants: {
    selected: {
      true: { borderColor: '$terminalCyanBorder', bg: '$terminalCyanSoft' },
      false: { borderColor: '$terminalBorder', bg: 'transparent' },
    },
  } as const,

  defaultVariants: { selected: false },
});

export function TerminalFilterButton({ selected, label, onPress }: { selected: boolean; label: string; onPress: () => void }) {
  return (
    <TerminalFilterButtonFrame selected={selected} onPress={onPress} aria-pressed={selected}>
      <MonoText size="$2" color={selected ? '$terminalCyan' : '$terminalMuted'}>{label}</MonoText>
    </TerminalFilterButtonFrame>
  );
}
