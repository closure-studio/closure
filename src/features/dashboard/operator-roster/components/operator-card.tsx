import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { XStack, YStack } from 'tamagui';

import { MonoText, TerminalMeterBar, TerminalPanel, TerminalText } from '@/components';
import type { Operator } from '@/schemas/game-account';

export const OPERATOR_CARD_MIN_WIDTH = 140;

const unavailable = '—';

export const OperatorCard = memo(function OperatorCard({
  name,
  operator,
}: {
  name: string;
  operator: Operator;
}) {
  const { t } = useTranslation('dashboard');
  const level = operator.level;
  return (
    <TerminalPanel testID={`operator-card-${operator.charId}`} minW={OPERATOR_CARD_MIN_WIDTH} grow={1} shrink={1} p="$3">
      <XStack justify="space-between"><MonoText size="$1" color="$appAccent">{operator.charId}</MonoText><MonoText size="$1">{t('operators.eliteLevel', { level: operator.evolvePhase ?? unavailable })}</MonoText></XStack>
      <TerminalText mt="$2" size="$4" fontWeight="800" numberOfLines={1}>{name}</TerminalText>
      <XStack mt="$2" justify="space-between"><MonoText size="$1">{t('operators.detail.level')}</MonoText><MonoText size="$1" color="$appAccent">{level ?? unavailable}</MonoText></XStack>
      {level !== undefined ? <YStack mt="$1.5"><TerminalMeterBar value={level} max={90} /></YStack> : null}
      <XStack mt="$2" justify="space-between"><MonoText size="$1">{t('operators.detail.potential')}</MonoText><TerminalText size="$2">{operator.potentialRank ?? unavailable}</TerminalText></XStack>
    </TerminalPanel>
  );
});
