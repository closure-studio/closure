import { useTranslation } from 'react-i18next';
import { XStack, YStack } from 'tamagui';

import { MonoText, TerminalCornerBrackets, TerminalPanel, TerminalSectionHeading, TerminalText } from '@/components';
import type { ArkHostGameLogEntry } from '@/schemas/arkhost';

export function ActivityTimelineView({ entries }: { entries: readonly ArkHostGameLogEntry[] }) {
  const { t } = useTranslation('dashboard');
  return (
    <YStack width="100%" maxW={860} self="center" gap="$3.5" pb="$4">
      <TerminalSectionHeading code="LOG" title={t('timeline.title')} subtitle="ARKHOST LOGS" />
      <YStack position="relative" gap="$2.5">
        <YStack position="absolute" t={0} b={0} l={9} width={1} bg="$appBorder" />
        {entries.map((entry) => (
          <XStack key={entry.id} position="relative" pl={40}>
            <YStack position="absolute" l={3} t={16} width={12} height={12} rotate="45deg" borderWidth={1} borderColor="$appAccent" bg="$appBackground" />
            <TerminalPanel width="100%" p="$3"><TerminalCornerBrackets /><XStack items="center" justify="space-between" gap="$2"><MonoText size="$1" color="$appAccent">{t('timeline.logLevel', { level: entry.logLevel })}</MonoText><MonoText size="$1">{new Date(entry.ts * 1000).toLocaleString()}</MonoText></XStack><TerminalText mt="$2" size="$3" lineHeight="$4" color="$appMuted">{entry.content}</TerminalText></TerminalPanel>
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}
