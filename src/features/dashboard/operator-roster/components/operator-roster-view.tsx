import { useTranslation } from 'react-i18next';
import { XStack, YStack } from 'tamagui';

import { MonoText, TerminalMeterBar, TerminalPanel, TerminalSectionHeading, TerminalText } from '@/components';
import type { Operator } from '@/schemas/game-account';

const unavailable = '—';

export function OperatorRosterView({
  getCharacterName,
  operators,
}: {
  getCharacterName: (characterId: string) => string;
  operators: readonly Operator[];
}) {
  const { t } = useTranslation('dashboard');
  return (
    <YStack gap="$3.5" pb="$4">
      <TerminalSectionHeading code="OP" title={t('operators.title')} subtitle={t('operators.unitCount', { count: operators.length })} />
      <XStack flexWrap="wrap" gap="$2">
        {operators.map((operator) => {
          const level = operator.level;
          return (
            <TerminalPanel key={operator.charId} width="48.7%" minW={140} grow={1} p="$3" $md={{ width: '31.5%' }} $lg={{ width: '23.5%' }} $xl={{ width: '18.5%' }}>
              <XStack justify="space-between"><MonoText size="$1" color="$appAccent">{operator.charId}</MonoText><MonoText size="$1">{t('operators.eliteLevel', { level: operator.evolvePhase ?? unavailable })}</MonoText></XStack>
              <TerminalText mt="$2" size="$4" fontWeight="800" numberOfLines={1}>{getCharacterName(operator.charId)}</TerminalText>
              <XStack mt="$2" justify="space-between"><MonoText size="$1">{t('operators.detail.level')}</MonoText><MonoText size="$1" color="$appAccent">{level ?? unavailable}</MonoText></XStack>
              {level !== undefined ? <YStack mt="$1.5"><TerminalMeterBar value={level} max={90} /></YStack> : null}
              <XStack mt="$2" justify="space-between"><MonoText size="$1">{t('operators.detail.potential')}</MonoText><TerminalText size="$2">{operator.potentialRank ?? unavailable}</TerminalText></XStack>
            </TerminalPanel>
          );
        })}
      </XStack>
    </YStack>
  );
}
