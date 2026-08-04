import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, Button, ScrollView, Sheet, XStack, YStack } from 'tamagui';

import { MonoText, TerminalFilterButton, TerminalMeterBar, TerminalPanel, TerminalSectionHeading, TerminalText } from '@/components';
import { useBackDismissal } from '@/hooks/use-back-dismissal';
import type { Operator } from '@/schemas/game-account';

import { OperatorRarity } from './operator-rarity';

const filters = ['全部', '近卫', '狙击', '术师', '医疗', '先锋'] as const;

export function OperatorRosterView({ operators }: { operators: readonly Operator[] }) {
  const { t } = useTranslation('dashboard');
  const [selectedProfession, setSelectedProfession] = useState<(typeof filters)[number]>('全部');
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const handleOperatorDetailsDismiss = useCallback(() => {
    setSelectedOperator(null);
  }, []);
  useBackDismissal(selectedOperator !== null, handleOperatorDetailsDismiss);
  const visibleOperators = useMemo(
    () => selectedProfession === '全部' ? operators : operators.filter((operator) => operator.class === selectedProfession),
    [operators, selectedProfession],
  );

  return (
    <YStack gap={16} pb="$4">
      <TerminalSectionHeading code="OP" title={t('operators.title')} subtitle={t('operators.unitCount', { count: operators.length })} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {filters.map((profession) => <TerminalFilterButton key={profession} label={profession} selected={profession === selectedProfession} onPress={() => setSelectedProfession(profession)} />)}
      </ScrollView>
      <XStack flexWrap="wrap" gap={8}>
        <AnimatePresence>
        {visibleOperators.map((operator) => (
          <Button
            key={operator.id}
            enterStyle={{ opacity: 0, scale: 0.9 }}
            exitStyle={{ opacity: 0, scale: 0.9 }}
            opacity={1}
            scale={1}
            unstyled
            width="48.7%"
            minW={140}
            grow={1}
            p={12}
            flexDirection="column"
            items="stretch"
            justify="flex-start"
            rounded="$0"
            bg="$terminalSurface"
            borderWidth={1}
            borderColor="$terminalBorder"
            hoverStyle={{ borderColor: '$terminalCyanBorder' }}
            pressStyle={{ borderColor: '$terminalCyanBorder', opacity: 0.75 }}
            onPress={() => setSelectedOperator(operator)}
            $platform-web={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}
            $md={{ width: '31.5%' }}
            $lg={{ width: '23.5%' }}
            $xl={{ width: '18.5%' }}
          >
            <XStack justify="space-between"><OperatorRarity rarity={operator.rarity} /><MonoText size="$1" color="$terminalCyan">{t('operators.eliteLevel', { level: operator.elite })}</MonoText></XStack>
            <YStack mt={8}>
              <TerminalText size="$4" fontWeight="800">{operator.name}</TerminalText>
              <MonoText size="$1" color={operator.class === '医疗' ? '$terminalSuccess' : operator.class === '近卫' || operator.class === '先锋' ? '$terminalWarning' : '$terminalCyan'} numberOfLines={1}>{operator.class} · {operator.codename}</MonoText>
            </YStack>
            <XStack mt={8} justify="space-between"><MonoText size="$1">{t('operators.level', { level: operator.level, maxLevel: operator.maxLevel })}</MonoText><MonoText size="$1" color="$terminalCyan">{t('operators.skillLevel', { level: operator.skillLevel })}</MonoText></XStack>
            <YStack mt={6}><TerminalMeterBar value={operator.level} max={operator.maxLevel} /></YStack>
          </Button>
        ))}
        </AnimatePresence>
      </XStack>

      <Sheet modal open={selectedOperator !== null} onOpenChange={(open: boolean) => !open && setSelectedOperator(null)} snapPointsMode="fit" dismissOnSnapToBottom zIndex={100000} transition="quickLessBouncy">
        <Sheet.Overlay transition="300ms" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} bg="$terminalScrim" />
        <Sheet.Frame maxW={460} width="100%" self="center" bg="transparent" px={29} pb={110}>
          {selectedOperator ? (
            <TerminalPanel cornerBrackets px={20} pt={29} pb={20}>
              <XStack items="flex-start" justify="space-between">
                <YStack gap="$1"><OperatorRarity rarity={selectedOperator.rarity} /><TerminalText size="$6" fontWeight="900">{selectedOperator.name}</TerminalText><MonoText size="$2" color="$terminalCyan">{selectedOperator.codename} · {selectedOperator.class}</MonoText></YStack>
                <Button unstyled py="$1" onPress={() => setSelectedOperator(null)} aria-label={t('operators.closeDetails')}><MonoText size="$2">{t('operators.close')}</MonoText></Button>
              </XStack>
              <XStack mt={16} flexWrap="wrap" gap={8}>
                {[
                  [t('operators.detail.elite'), `E${selectedOperator.elite}`], [t('operators.detail.level'), String(selectedOperator.level)], [t('operators.detail.potential'), String(selectedOperator.potential)],
                  [t('operators.detail.trust'), `${selectedOperator.trust}%`], [t('operators.detail.skill'), `L${selectedOperator.skillLevel}`], [t('operators.detail.proficiency'), selectedOperator.proficiency.map((value) => `M${value}`).join(' ')],
                ].map(([label, value]) => <TerminalPanel key={label} width="31%" minW={0} grow={1} p={8} bg="$terminalRaisedTranslucent"><MonoText size="$2">{label}</MonoText><TerminalText mt={2} size="$3">{value}</TerminalText></TerminalPanel>)}
              </XStack>
              <YStack mt={16} gap={4}><MonoText size="$1">{t('operators.upgradeProgress')}</MonoText><TerminalMeterBar value={selectedOperator.level} max={selectedOperator.maxLevel} /><MonoText size="$1">{selectedOperator.level} / {selectedOperator.maxLevel}</MonoText></YStack>
            </TerminalPanel>
          ) : null}
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
}
