import { Activity, Coins, Gem, Ticket, TriangleAlert, Zap } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { XStack, YStack, getTokens } from 'tamagui';

import { DecorativeBarcode, MonoText, TerminalMeterBar, TerminalPanel, TerminalSectionHeading, TerminalText } from '@/components';
import { ARK_HOST_GAME_STATUS_CODE } from '@/schemas/arkhost';
import type { ArkHostGameDetail } from '@/schemas/arkhost';
import type { GameAccount } from '@/schemas/game-account';
import { formatCompactNumber } from '../utils';

const unavailable = '—';

export function GameAccountOverviewView({
  detail,
  gameAccount,
  stageLabel,
}: {
  detail: ArkHostGameDetail | null;
  gameAccount: GameAccount;
  stageLabel: string;
}) {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const colors = getTokens().color;
  const status = detail?.status;
  const accountBalances = [
    { icon: Coins, label: t('overview.balances.lmd'), value: status ? formatCompactNumber(status.gold) : unavailable, color: colors.appWarning.val },
    { icon: Gem, label: t('overview.balances.orundum'), value: status ? formatCompactNumber(status.diamondShard) : unavailable, color: colors.appAccent.val },
    { icon: Zap, label: t('overview.balances.originium'), value: status ? String(status.androidDiamond) : unavailable, color: colors.appAccent.val },
    { icon: Ticket, label: t('overview.balances.recruitTickets'), value: status ? String(status.recruitLicense) : unavailable, color: colors.appText.val },
  ];
  const maxAp = status?.maxAp ?? 0;
  const currentAp = status?.ap ?? gameAccount.ap;
  const isSanityAtCapacity = maxAp > 0 && currentAp >= maxAp;
  const serverLabel = gameAccount.platform === 1 ? t('overview.channels.official') : gameAccount.platform === 2 ? t('overview.channels.bilibili') : unavailable;

  return (
    <XStack flexWrap="wrap" items="flex-start" gap={20} pb="$4">
      <YStack width="100%" $xl={{ width: '65%' }}>
        <TerminalPanel cornerBrackets p="$3.5" minH={166}>
          <XStack mb={12} items="center" justify="space-between"><MonoText size="$1" color="$appAccent">{t('overview.profile')}</MonoText><DecorativeBarcode /></XStack>
          <XStack items="flex-end" justify="space-between" gap="$3">
            <YStack minW={0} grow={1} gap="$0.5">
              <MonoText size="$2">{gameAccount.statusText || unavailable}</MonoText>
              <TerminalText size="$6" fontWeight="800" numberOfLines={1}>{status?.nickName || gameAccount.nickname || gameAccount.account}</TerminalText>
              <MonoText size="$1" numberOfLines={1}>{gameAccount.account} · {serverLabel}</MonoText>
            </YStack>
            <YStack items="flex-end"><MonoText size="$1">{t('overview.level')}</MonoText><TerminalText size="$9" lineHeight="$9" fontWeight="900" color="$appAccent">{status?.level ?? gameAccount.level}</TerminalText></YStack>
          </XStack>
          <XStack mt={12} items="center" justify="space-between">
            <MonoText size="$1">{t('overview.experience')} {unavailable}</MonoText>
            <XStack items="center" gap="$1"><Activity size={12} color={gameAccount.statusCode === ARK_HOST_GAME_STATUS_CODE.running ? colors.appSuccess.val : colors.appMuted.val} /><MonoText size="$1" color={gameAccount.statusCode === ARK_HOST_GAME_STATUS_CODE.running ? '$appSuccess' : '$appMuted'}>{gameAccount.statusText || unavailable}</MonoText></XStack>
          </XStack>
        </TerminalPanel>
      </YStack>

      <YStack width="100%" $lg={{ width: '48%' }} $xl={{ width: '31.5%' }}>
        <TerminalPanel p="$3.5" tone={isSanityAtCapacity ? 'warning' : 'default'}>
          <TerminalSectionHeading code="01" title={t('overview.sanity')} subtitle="AP CORE" trailing={<MonoText size="$1">{unavailable}</MonoText>} />
          <XStack mt={12} items="center" gap="$2">
            <TerminalText size="$8" fontWeight="800" color={isSanityAtCapacity ? '$appWarning' : '$appAccent'}>{currentAp}</TerminalText>
            <MonoText size="$3">/ {maxAp || unavailable}</MonoText>
            {isSanityAtCapacity ? <XStack ml="auto" items="center" gap="$1" px="$2" py="$1" bg="$appWarningSoft"><TriangleAlert size={13} color={colors.appWarning.val} /><MonoText size="$1" color="$appWarning">{t('overview.overflow')}</MonoText></XStack> : null}
          </XStack>
          {maxAp > 0 ? <YStack mt={8}><TerminalMeterBar value={currentAp} max={maxAp} tone={isSanityAtCapacity ? 'warning' : 'cyan'} /></YStack> : null}
        </TerminalPanel>
      </YStack>

      <YStack width="100%" $lg={{ width: '48%' }} $xl={{ width: '31.5%' }}>
        <YStack gap="$2"><TerminalSectionHeading code="02" title={t('overview.assets')} subtitle="ASSETS" /><XStack flexWrap="wrap" gap="$2">
          {accountBalances.map((balance) => { const Icon = balance.icon; return <TerminalPanel key={balance.label} width="48.7%" minW={140} grow={1} p="$3" flexDirection="row" items="center" gap="$3" $lg={{ width: '23.5%' }}><Icon size={20} color={balance.color} strokeWidth={1.6} /><YStack minW={0}><TerminalText size="$5" fontWeight="800">{balance.value}</TerminalText><MonoText size="$1">{balance.label}</MonoText></YStack></TerminalPanel>; })}
        </XStack></YStack>
      </YStack>

      <YStack width="100%" $lg={{ width: '48%' }} $xl={{ width: '31.5%' }}>
        <YStack gap="$2"><TerminalSectionHeading code="03" title={t('overview.operationMetrics')} subtitle="METRICS" /><XStack flexWrap="wrap" gap="$2">
          {[t('overview.metrics.map'), t('overview.metrics.autoBattle'), t('overview.metrics.baseArrange'), t('overview.metrics.keepingAp')].map((label, index) => {
            const values = [stageLabel, gameAccount.config.is_auto_battle ? tCommon('states.enabled') : tCommon('states.disabled'), gameAccount.config.enable_building_arrange ? tCommon('states.enabled') : tCommon('states.disabled'), String(gameAccount.config.keeping_ap)];
            return <TerminalPanel key={label} width="48.7%" minW={140} grow={1} p="$3" $lg={{ width: '23.5%' }}><MonoText size="$1">{label}</MonoText><TerminalText size="$5" fontWeight="800" numberOfLines={1}>{values[index]}</TerminalText></TerminalPanel>;
          })}
        </XStack></YStack>
      </YStack>

      <YStack width="100%" $xl={{ width: '31.5%' }}>
        <TerminalPanel cornerBrackets p="$4" gap="$3"><TerminalSectionHeading code="04" title={t('overview.base')} subtitle="BASE" />
          {[t('overview.baseMetrics.mood'), t('overview.baseMetrics.factoryLoad'), t('overview.baseMetrics.trainingLoad')].map((label) => <XStack key={label} justify="space-between"><MonoText size="$2">{label}</MonoText><TerminalText size="$2">{unavailable}</TerminalText></XStack>)}
        </TerminalPanel>
      </YStack>
    </XStack>
  );
}
