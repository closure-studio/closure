import { useTranslation } from 'react-i18next';
import { XStack, YStack } from 'tamagui';

import { MonoText, TerminalSectionHeading, TerminalText } from '@/components';
import type { ArkHostGameLogEntry } from '@/schemas/arkhost';
import { DashboardSummaryFrame, formatDashboardSummaryTitle } from './dashboard-summary-frame';
import type { DashboardSummarySection } from './dashboard-summary-frame';

export function GameLogsView({
  activeSection,
  entries,
  onActivate,
}: {
  activeSection: DashboardSummarySection;
  entries: readonly ArkHostGameLogEntry[];
  onActivate: (section: DashboardSummarySection) => void;
}) {
  const { t } = useTranslation('dashboard');

  return (
    <YStack testID="game-logs-view" width="100%" minW={0}>
      <DashboardSummaryFrame
        activeSection={activeSection}
        label={t('logs.title')}
        onActivate={onActivate}
        section="logs"
        testID="game-logs-frame"
        width="100%"
        p="$3.5"
        gap="$3.5"
      >
        <YStack width="100%" maxW={860} self="center" gap="$3.5">
          <TerminalSectionHeading code="LOG" title={formatDashboardSummaryTitle(t('logs.title'))} />
          <YStack position="relative" gap="$2.5">
            <YStack position="absolute" t={0} b={0} l={9} width={1} bg="$appBorder" />
            {entries.map((entry) => (
              <XStack key={entry.id} position="relative" pl={40}>
                <YStack position="absolute" l={3} t={16} width={12} height={12} rotate="45deg" borderWidth={1} borderColor="$appAccent" bg="$appBackground" />
                <YStack grow={1} minW={0}>
                  <XStack items="center" justify="space-between" gap="$2">
                    <MonoText size="$1" color="$appAccent">{t('logs.logLevel', { level: entry.logLevel })}</MonoText>
                    <MonoText size="$1">{new Date(entry.ts * 1000).toLocaleString()}</MonoText>
                  </XStack>
                  <TerminalText mt="$2" size="$3" lineHeight="$4" color="$appMuted">{entry.content}</TerminalText>
                </YStack>
              </XStack>
            ))}
          </YStack>
        </YStack>
      </DashboardSummaryFrame>
    </YStack>
  );
}
