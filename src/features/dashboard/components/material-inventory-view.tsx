import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, ScrollView, XStack, YStack } from 'tamagui';

import { MonoText, TerminalFilterButton, TerminalMeterBar, TerminalPanel, TerminalSectionHeading, TerminalText } from '@/components';
import type { Material } from '@/schemas/game-account';

const categories = ['基础素材', '进阶素材', '芯片', '技巧概要'] as const;

function MaterialInventoryItem({ material }: { material: Material }) {
  const { t } = useTranslation('dashboard');
  const hasShortage = material.owned < material.needed;
  return (
    <TerminalPanel transition="quickLessBouncy" enterStyle={{ opacity: 0, y: 12 }} exitStyle={{ opacity: 0, scale: 0.9 }} opacity={1} y={0} scale={1} width="48.7%" minW={140} grow={1} p={12} tone={material.tier >= 5 ? 'warning' : material.tier === 4 ? 'cyan' : 'default'} $md={{ width: '31.5%' }} $lg={{ width: '23.5%' }} $xl={{ width: '18.5%' }}>
      <XStack items="center" justify="space-between">
        <MonoText size="$1" color={material.tier >= 5 ? '$appWarning' : material.tier === 4 ? '$appAccent' : '$appMuted'}>{t('inventory.tier', { tier: material.tier })}</MonoText>
        {hasShortage ? <MonoText size="$1" color="$appWarning">{t('inventory.shortage', { count: material.needed - material.owned })}</MonoText> : null}
      </XStack>
      <TerminalText mt={4} size="$3" fontWeight="700">{material.name}</TerminalText>
      <XStack mt={8} items="baseline" gap="$1">
        <TerminalText size="$5.5" fontWeight="800" color={hasShortage ? '$appWarning' : '$appText'}>{material.owned}</TerminalText>
        <MonoText size="$1">/ {material.needed}</MonoText>
      </XStack>
      <YStack mt={6}><TerminalMeterBar value={material.owned} max={material.needed} tone={hasShortage ? 'warning' : 'success'} /></YStack>
    </TerminalPanel>
  );
}

export function MaterialInventoryView({ materials }: { materials: readonly Material[] }) {
  const { t } = useTranslation('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>('基础素材');
  const visibleMaterials = useMemo(() => materials.filter((material) => material.category === selectedCategory), [materials, selectedCategory]);
  const shortageCount = materials.filter((material) => material.owned < material.needed).length;
  return (
    <YStack gap={16} pb="$4">
      <TerminalSectionHeading code="INV" title={t('inventory.title')} subtitle={t('inventory.itemCount', { count: materials.length })} />
      <TerminalPanel p="$3" flexDirection="row" items="center" justify="space-between" gap="$3">
        <YStack minW={0} grow={1}><MonoText size="$1">{t('inventory.synthesisPlanning')}</MonoText><TerminalText size="$3">{t('inventory.shortageSummary', { count: shortageCount })}</TerminalText></YStack>
        <YStack px="$3" py="$2" bg="$appAccentSoft"><MonoText size="$1" color="$appAccent">{t('inventory.autoPlan')}</MonoText></YStack>
      </TerminalPanel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {categories.map((category) => <TerminalFilterButton key={category} label={category} selected={category === selectedCategory} onPress={() => setSelectedCategory(category)} />)}
      </ScrollView>
      <XStack flexWrap="wrap" gap={8}><AnimatePresence>{visibleMaterials.map((material) => <MaterialInventoryItem key={material.id} material={material} />)}</AnimatePresence></XStack>
    </YStack>
  );
}
