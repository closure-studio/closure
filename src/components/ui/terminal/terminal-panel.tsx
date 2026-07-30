import type { PropsWithChildren } from 'react';
import { YStack, styled } from 'tamagui';

const TerminalPanelFrame = styled(YStack, {
  name: 'TerminalPanel',
  position: 'relative',
  overflow: 'hidden',
  bg: '$terminalSurface',
  borderWidth: 1,
  borderColor: '$terminalBorder',
  rounded: '$0',
  '$platform-web': {
    clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
  },

  variants: {
    tone: {
      default: {},
      cyan: { bg: '$terminalCyanSoft', borderColor: '$terminalCyanBorder' },
      warning: { bg: '$terminalWarningSoft', borderColor: '$terminalWarningBorder' },
      success: { bg: '$terminalSuccessSoft', borderColor: '$terminalSuccess' },
      danger: { bg: '$terminalDangerSoft', borderColor: '$terminalDangerBorder' },
    },
  } as const,

  defaultVariants: { tone: 'default' },
});

export function TerminalCornerBrackets() {
  return (
    <>
      <YStack position="absolute" t={0} l={0} width={12} height={12} borderColor="$terminalCyanRing" borderTopWidth={1} borderLeftWidth={1} style={{ pointerEvents: 'none' }} />
      <YStack position="absolute" t={0} r={0} width={12} height={12} borderColor="$terminalCyanRing" borderTopWidth={1} borderRightWidth={1} style={{ pointerEvents: 'none' }} />
      <YStack position="absolute" b={0} l={0} width={12} height={12} borderColor="$terminalCyanRing" borderBottomWidth={1} borderLeftWidth={1} style={{ pointerEvents: 'none' }} />
      <YStack position="absolute" b={0} r={0} width={12} height={12} borderColor="$terminalCyanRing" borderBottomWidth={1} borderRightWidth={1} style={{ pointerEvents: 'none' }} />
    </>
  );
}

export function TerminalPanel({ children, cornerBrackets = false, ...props }: PropsWithChildren<{ cornerBrackets?: boolean } & React.ComponentProps<typeof TerminalPanelFrame>>) {
  return (
    <TerminalPanelFrame {...props}>
      {cornerBrackets ? <TerminalCornerBrackets /> : null}
      {children}
    </TerminalPanelFrame>
  );
}
