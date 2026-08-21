import type { ComponentProps, PropsWithChildren } from 'react';
import { YStack, styled } from 'tamagui';

const FrameRoot = styled(YStack, {
  name: 'Frame',
  position: 'relative',
  overflow: 'hidden',
  bg: '$appSurface',
  borderWidth: 1,
  borderColor: '$appBorder',
  rounded: '$0',
  '$platform-web': {
    clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
  },

  variants: {
    tone: {
      default: {},
      cyan: { bg: '$appAccentSoft', borderColor: '$appAccentBorder' },
      warning: { bg: '$appWarningSoft', borderColor: '$appWarningBorder' },
      success: { bg: '$appSuccessSoft', borderColor: '$appSuccess' },
      danger: { bg: '$appDangerSoft', borderColor: '$appDangerBorder' },
    },
  } as const,

  defaultVariants: { tone: 'default' },
});

function getCornerTestID(testIDPrefix: string | undefined, corner: string): string | undefined {
  return testIDPrefix ? `${testIDPrefix}-corner-${corner}` : undefined;
}

export function CornerBrackets({ testIDPrefix }: { testIDPrefix?: string } = {}) {
  return (
    <>
      <YStack testID={getCornerTestID(testIDPrefix, 'top-left')} position="absolute" t={0} l={0} width={12} height={12} borderColor="$appAccentRing" borderTopWidth={1} borderLeftWidth={1} style={{ pointerEvents: 'none' }} />
      <YStack testID={getCornerTestID(testIDPrefix, 'top-right')} position="absolute" t={0} r={0} width={12} height={12} borderColor="$appAccentRing" borderTopWidth={1} borderRightWidth={1} style={{ pointerEvents: 'none' }} />
      <YStack testID={getCornerTestID(testIDPrefix, 'bottom-left')} position="absolute" b={0} l={0} width={12} height={12} borderColor="$appAccentRing" borderBottomWidth={1} borderLeftWidth={1} style={{ pointerEvents: 'none' }} />
      <YStack testID={getCornerTestID(testIDPrefix, 'bottom-right')} position="absolute" b={0} r={0} width={12} height={12} borderColor="$appAccentRing" borderBottomWidth={1} borderRightWidth={1} style={{ pointerEvents: 'none' }} />
    </>
  );
}

export type FrameProps = PropsWithChildren<{
  cornerBrackets?: boolean;
  selected?: boolean;
} & ComponentProps<typeof FrameRoot>>;

export function Frame({ children, cornerBrackets = false, selected, testID, ...props }: FrameProps) {
  const showCornerBrackets = selected ?? cornerBrackets;
  const testIDPrefix = typeof testID === 'string' ? testID : undefined;

  return (
    <FrameRoot testID={testID} {...props}>
      {showCornerBrackets ? <CornerBrackets {...(testIDPrefix ? { testIDPrefix } : {})} /> : null}
      {children}
    </FrameRoot>
  );
}
