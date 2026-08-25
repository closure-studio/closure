import { useTranslation } from 'react-i18next';
import { XStack, YStack } from 'tamagui';

import { CornerBrackets, Frame, MonoText, TerminalSectionHeading, TerminalText } from '@/components';
import type { DashboardScheduleEntry } from '@/schemas/dashboard';

const toneByCategory: Record<DashboardScheduleEntry['category'], 'cyan' | 'warning' | 'danger' | 'default'> = {
  event: 'cyan',
  banner: 'warning',
  maintenance: 'danger',
  notice: 'default',
};

const colorByCategory = {
  event: '$appAccent',
  banner: '$appWarning',
  maintenance: '$appDanger',
  notice: '$appMuted',
} as const satisfies Record<DashboardScheduleEntry['category'], string>;

export function ActivityTimelineView({ entries }: { entries: readonly DashboardScheduleEntry[] }) {
  const { t } = useTranslation('dashboard');
  return (
    <YStack testID="dashboard-schedule" width="100%" maxW={860} self="center" gap="$3.5" pb="$4">
      <TerminalSectionHeading code="SCHEDULE" title={t('timeline.title')} subtitle="TIMELINE" />
      <YStack position="relative" gap="$2.5">
        <YStack position="absolute" t={0} b={0} l={9} width={1} bg="$appBorder" />
        {entries.map((entry) => (
          <XStack key={entry.id} position="relative" pl={40}>
            <YStack position="absolute" l={3} t={16} width={12} height={12} rotate="45deg" borderWidth={1} borderColor="$appAccent" bg="$appBackground" items="center" justify="center">
              <YStack width={4} height={4} bg="$appAccent" />
            </YStack>
            <Frame testID={`dashboard-schedule-entry-${entry.id}`} width="100%" p="$3" tone={toneByCategory[entry.category]}>
              <CornerBrackets />
              <XStack items="center" justify="space-between" gap="$2">
                <MonoText size="$1" color={colorByCategory[entry.category]}>{t(`timeline.entries.${entry.id}.tag`)}</MonoText>
                <YStack px="$2" py="$0.5" bg={entry.status === 'active' ? '$appSuccessSoft' : entry.status === 'upcoming' ? '$appWarningSoft' : '$appSurfaceRaised'}>
                  <MonoText size="$1" color={entry.status === 'active' ? '$appSuccess' : entry.status === 'upcoming' ? '$appWarning' : '$appMuted'}>{t(`timeline.status.${entry.status}`)}</MonoText>
                </YStack>
              </XStack>
              <TerminalText mt="$1" size="$4" fontWeight="800">{t(`timeline.entries.${entry.id}.title`)}</TerminalText>
              <MonoText mt="$2" size="$1">{t(`timeline.entries.${entry.id}.scheduleLabel`)}</MonoText>
              <TerminalText mt="$2" size="$3" lineHeight="$4" color="$appMuted">{t(`timeline.entries.${entry.id}.description`)}</TerminalText>
            </Frame>
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}
