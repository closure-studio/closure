import { YStack } from 'tamagui';

export function TerminalMeterBar({
  value,
  max = 100,
  tone = 'cyan',
}: {
  value: number;
  max?: number;
  tone?: 'cyan' | 'warning' | 'success' | 'muted';
}) {
  const fillPercentage: `${number}%` = `${Math.max(0, Math.min(100, (value / max) * 100))}%`;
  const fillColorByTone = {
    cyan: '$terminalCyan',
    warning: '$terminalWarning',
    success: '$terminalSuccess',
    muted: '$terminalMuted',
  } as const;

  return (
    <YStack height={6} width="100%" overflow="hidden" bg="$terminalRaised">
      <YStack transition="500ms" height="100%" width={fillPercentage} bg={fillColorByTone[tone]} />
    </YStack>
  );
}
