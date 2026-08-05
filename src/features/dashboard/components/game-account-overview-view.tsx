import { Activity, Coins, Gem, Ticket, TriangleAlert, Zap } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { XStack, YStack, getTokens } from 'tamagui';

import { DecorativeBarcode, MonoText, type ScrollViewportMetrics, TerminalMeterBar, TerminalPanel, TerminalSectionHeading, TerminalText } from '@/components';
import type { GameAccount } from '@/schemas/game-account';
import { formatCompactNumber } from '../utils';
import { DashboardViewportReveal } from './dashboard-viewport-reveal';

export function GameAccountOverviewView({ gameAccount, viewport }: { gameAccount: GameAccount; viewport: ScrollViewportMetrics }) {
  const { t } = useTranslation('dashboard');
  const colors = getTokens().color;
  const accountBalances = [
    { icon: Coins, label: t('overview.balances.lmd'), value: formatCompactNumber(gameAccount.lmd), color: colors.appWarning.val },
    { icon: Gem, label: t('overview.balances.orundum'), value: formatCompactNumber(gameAccount.orundum), color: colors.appAccent.val },
    { icon: Zap, label: t('overview.balances.originium'), value: String(gameAccount.originium), color: colors.appAccent.val },
    { icon: Ticket, label: t('overview.balances.recruitTickets'), value: String(gameAccount.recruitTickets), color: colors.appText.val },
  ];
  const baseMetrics = [
    { label: t('overview.baseMetrics.mood'), value: gameAccount.baseMood, tone: 'cyan' as const },
    { label: t('overview.baseMetrics.factoryLoad'), value: gameAccount.factoryLoad, tone: 'warning' as const },
    { label: t('overview.baseMetrics.trainingLoad'), value: gameAccount.trainingLoad, tone: 'success' as const },
  ];
  const isSanityAtCapacity = gameAccount.ap[0] >= gameAccount.ap[1];

  return (
    <XStack flexWrap="wrap" items="flex-start" gap={20} pb="$4">
      <YStack width="100%" $xl={{ width: '65%' }}>
      <DashboardViewportReveal index={0} origin="bottom" viewport={viewport}>
      <TerminalPanel cornerBrackets p="$3.5" minH={166}>
        <XStack mb={12} items="center" justify="space-between">
          <MonoText size="$1" color="$appAccent">{t('overview.profile')}</MonoText>
          <DecorativeBarcode />
        </XStack>
        <XStack items="flex-end" justify="space-between" gap="$3">
          <YStack minW={0} grow={1} gap="$0.5">
            <MonoText size="$2">{gameAccount.drTitle}</MonoText>
            <TerminalText size="$6" fontWeight="800" numberOfLines={1}>{gameAccount.callsign}</TerminalText>
            <MonoText size="$1" numberOfLines={1}>{gameAccount.uid} · {gameAccount.server}</MonoText>
          </YStack>
          <YStack items="flex-end">
            <MonoText size="$1">{t('overview.level')}</MonoText>
            <TerminalText size="$9" lineHeight="$9" fontWeight="900" color="$appAccent">{gameAccount.doctorLevel}</TerminalText>
          </YStack>
        </XStack>
        <XStack mt={12} items="center" justify="space-between">
          <MonoText size="$1">{t('overview.experience')} {formatCompactNumber(gameAccount.exp[0])} / {formatCompactNumber(gameAccount.exp[1])}</MonoText>
          <XStack items="center" gap="$1"><Activity size={12} color={colors.appSuccess.val} /><MonoText size="$1" color="$appSuccess">{gameAccount.online}</MonoText></XStack>
        </XStack>
        <YStack mt={4}><TerminalMeterBar value={gameAccount.exp[0]} max={gameAccount.exp[1]} /></YStack>
      </TerminalPanel>
      </DashboardViewportReveal>
      </YStack>

      <YStack width="100%" $lg={{ width: '48%' }} $xl={{ width: '31.5%' }}>
      <DashboardViewportReveal index={1} origin="bottom" viewport={viewport}>
      <TerminalPanel p="$3.5" tone={isSanityAtCapacity ? 'warning' : 'default'}>
        <TerminalSectionHeading code="01" title={t('overview.sanity')} subtitle="AP CORE" trailing={<MonoText size="$1" color={isSanityAtCapacity ? '$appWarning' : '$appMuted'}>{t('overview.recoversAt', { time: gameAccount.apRecoverAt })}</MonoText>} />
        <XStack mt={12} items="center" gap="$2">
          <TerminalText size="$8" fontWeight="800" color={isSanityAtCapacity ? '$appWarning' : '$appAccent'}>{gameAccount.ap[0]}</TerminalText>
          <MonoText size="$3">/ {gameAccount.ap[1]}</MonoText>
          {isSanityAtCapacity ? <XStack ml="auto" items="center" gap="$1" px="$2" py="$1" bg="$appWarningSoft"><TriangleAlert size={13} color={colors.appWarning.val} /><MonoText size="$1" color="$appWarning">{t('overview.overflow')}</MonoText></XStack> : null}
        </XStack>
        <YStack mt={8}><TerminalMeterBar value={gameAccount.ap[0]} max={gameAccount.ap[1]} tone={isSanityAtCapacity ? 'warning' : 'cyan'} /></YStack>
      </TerminalPanel>
      </DashboardViewportReveal>
      </YStack>

      <YStack width="100%" $lg={{ width: '48%' }} $xl={{ width: '31.5%' }}>
      <DashboardViewportReveal index={2} origin="bottom" viewport={viewport}>
      <YStack gap="$2">
        <TerminalSectionHeading code="02" title={t('overview.assets')} subtitle="ASSETS" />
        <XStack flexWrap="wrap" gap="$2">
          {accountBalances.map((balance) => {
            const Icon = balance.icon;
            return (
              <TerminalPanel key={balance.label} width="48.7%" minW={140} grow={1} p="$3" flexDirection="row" items="center" gap="$3" $lg={{ width: '23.5%' }}>
                <Icon size={20} color={balance.color} strokeWidth={1.6} />
                <YStack minW={0}>
                  <TerminalText size="$5" fontWeight="800">{balance.value}</TerminalText>
                  <MonoText size="$1">{balance.label}</MonoText>
                </YStack>
              </TerminalPanel>
            );
          })}
        </XStack>
      </YStack>
      </DashboardViewportReveal>
      </YStack>

      <YStack width="100%" $lg={{ width: '48%' }} $xl={{ width: '31.5%' }}>
      <DashboardViewportReveal index={3} origin="bottom" viewport={viewport}>
      <YStack gap="$2">
        <TerminalSectionHeading code="03" title={t('overview.operationMetrics')} subtitle="METRICS" />
        <XStack flexWrap="wrap" gap="$2">
          {gameAccount.stats.map((stat) => (
            <TerminalPanel key={stat.label} width="48.7%" minW={140} grow={1} p="$3" tone={stat.warn ? 'warning' : 'default'} $lg={{ width: '23.5%' }}>
              <MonoText size="$1">{stat.label}</MonoText>
              <XStack items="baseline" gap="$1.5">
                <TerminalText size="$6" fontWeight="800" color={stat.warn ? '$appWarning' : '$appText'}>{stat.value}</TerminalText>
                {stat.trend ? <MonoText size="$1" color="$appSuccess">{stat.trend}</MonoText> : null}
              </XStack>
            </TerminalPanel>
          ))}
        </XStack>
      </YStack>
      </DashboardViewportReveal>
      </YStack>

      <YStack width="100%" $xl={{ width: '31.5%' }}>
      <DashboardViewportReveal index={4} origin="bottom" viewport={viewport}>
      <TerminalPanel cornerBrackets p="$4" gap="$3">
        <TerminalSectionHeading code="04" title={t('overview.base')} subtitle="BASE" trailing={<MonoText size="$1">{gameAccount.progress}</MonoText>} />
        {baseMetrics.map((metric) => (
          <YStack key={metric.label} gap="$1">
            <XStack justify="space-between"><MonoText size="$2">{metric.label}</MonoText><TerminalText size="$2">{metric.value}%</TerminalText></XStack>
            <TerminalMeterBar value={metric.value} tone={metric.tone} />
          </YStack>
        ))}
      </TerminalPanel>
      </DashboardViewportReveal>
      </YStack>
    </XStack>
  );
}
