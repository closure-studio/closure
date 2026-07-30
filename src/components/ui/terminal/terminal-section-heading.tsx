import type { ReactNode } from 'react';
import { XStack } from 'tamagui';

import { MonoText, TerminalText } from './typography';

export function TerminalSectionHeading({
  code,
  title,
  subtitle,
  trailing,
}: {
  code?: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}) {
  return (
    <XStack items="baseline" gap="$2" minW={0}>
      {code ? <MonoText size="$2.5" color="$terminalCyan">{code}</MonoText> : null}
      <TerminalText size="$3" fontWeight="700" letterSpacing={2.8} textTransform="uppercase" shrink={1}>{title}</TerminalText>
      {subtitle ? <MonoText size="$1" textTransform="uppercase" shrink={1}>{subtitle}</MonoText> : null}
      {trailing ? <XStack ml="auto">{trailing}</XStack> : null}
    </XStack>
  );
}
