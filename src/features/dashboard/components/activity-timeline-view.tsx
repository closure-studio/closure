import { useTranslation } from 'react-i18next';
import { XStack, YStack } from 'tamagui';

import { MonoText, TerminalCornerBrackets, TerminalPanel, TerminalSectionHeading, TerminalText } from '@/components';
import type { ActivityTimelineEntry } from '@/schemas/game-account';

const toneByCategory: Record<ActivityTimelineEntry['category'], 'cyan' | 'warning' | 'danger' | 'default'> = {
  event: 'cyan',
  banner: 'warning',
  maintenance: 'danger',
  notice: 'default',
};

export function ActivityTimelineView({ entries }: { entries: readonly ActivityTimelineEntry[] }) {
  const { t } = useTranslation('dashboard');
  return (
    <YStack width="100%" maxW={860} self="center" gap={16} pb="$4">
      <TerminalSectionHeading code="LOG" title={t('timeline.title')} subtitle="TIMELINE" />
      <YStack position="relative" gap={12}>
        <YStack position="absolute" t={0} b={0} l={9} width={1} bg="$appBorder" />
        {entries.map((entry) => (
          <XStack key={entry.id} position="relative" pl={40}>
            <YStack position="absolute" l={3} t={16} width={12} height={12} rotate="45deg" borderWidth={1} borderColor="$appAccent" bg="$appBackground" items="center" justify="center">
              <YStack width={4} height={4} bg="$appAccent" />
            </YStack>
            <TerminalPanel width="100%" p={12} tone={toneByCategory[entry.category]}>
              <TerminalCornerBrackets />
              <XStack items="center" justify="space-between" gap="$2">
                <MonoText size="$1" color={entry.category === 'banner' ? '$appWarning' : entry.category === 'maintenance' ? '$appDanger' : entry.category === 'notice' ? '$appMuted' : '$appAccent'}>{entry.tag}</MonoText>
                <YStack px="$2" py="$0.5" bg={entry.status === 'active' ? '$appSuccessSoft' : entry.status === 'upcoming' ? '$appWarningSoft' : '$appSurfaceRaised'}>
                  <MonoText size="$1" color={entry.status === 'active' ? '$appSuccess' : entry.status === 'upcoming' ? '$appWarning' : '$appMuted'}>{t(`timeline.status.${entry.status}`)}</MonoText>
                </YStack>
              </XStack>
              <TerminalText mt={4} size="$4" fontWeight="800">{entry.title}</TerminalText>
              <MonoText mt={8} size="$1">{entry.scheduleLabel}</MonoText>
              <TerminalText mt={8} size="$3" lineHeight="$4" color="$appMuted">{entry.description}</TerminalText>
            </TerminalPanel>
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}
