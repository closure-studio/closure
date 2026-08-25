import { Activity, TriangleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XStack, YStack, getTokens } from 'tamagui';

import apGameplayImage from '@/assets/images/inventory/original/AP_GAMEPLAY.webp';
import diamondImage from '@/assets/images/inventory/original/DIAMOND.webp';
import diamondShdImage from '@/assets/images/inventory/original/DIAMOND_SHD.webp';
import goldImage from '@/assets/images/inventory/original/GOLD.webp';
import recruitTicketImage from '@/assets/images/inventory/original/TKT_RECRUIT.webp';
import { DecorativeBarcode, ItemArtwork, MonoText, TerminalMeterBar, TerminalSectionHeading, TerminalText } from '@/components';
import { useLayoutSize } from '@/providers/layout-size-provider';
import { ARK_HOST_GAME_STATUS_CODE, type ArkHostGameDetail, type ArkHostGameLogEntry } from '@/schemas/arkhost';
import type { GameAccount } from '@/schemas/game-account';
import { DashboardSummaryFrame, formatDashboardSummaryTitle } from './dashboard-summary-frame';
import type { DashboardSummarySection } from './dashboard-summary-frame';
import { GameLogsView } from './game-logs-view';
import { formatCompactNumber } from '../utils';

const unavailable = '—';
const SUMMARY_ITEM_IMAGES = {
  AP_GAMEPLAY: apGameplayImage,
  GOLD: goldImage,
  DIAMOND_SHD: diamondShdImage,
  DIAMOND: diamondImage,
  TKT_RECRUIT: recruitTicketImage,
} as const;

type SummaryItemIcon = keyof typeof SUMMARY_ITEM_IMAGES;

export function GameAccountOverviewView({
  detail,
  gameAccount,
  logs,
  stageSubtitle,
  stageTitle,
}: {
  detail: ArkHostGameDetail | null;
  gameAccount: GameAccount;
  logs: readonly ArkHostGameLogEntry[];
  stageSubtitle: string | undefined;
  stageTitle: string;
}) {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const [activeSection, setActiveSection] = useState<DashboardSummarySection>('profile');
  const layoutSize = useLayoutSize();
  const colors = getTokens().color;
  const status = detail?.status;
  const accountBalances = [
    { itemIcon: 'GOLD', section: 'asset-gold', label: t('overview.balances.lmd'), value: status ? formatCompactNumber(status.gold) : unavailable },
    { itemIcon: 'DIAMOND_SHD', section: 'asset-orundum', label: t('overview.balances.orundum'), value: status ? formatCompactNumber(status.diamondShard) : unavailable },
    { itemIcon: 'DIAMOND', section: 'asset-originium', label: t('overview.balances.originium'), value: status ? String(status.androidDiamond) : unavailable },
    { itemIcon: 'TKT_RECRUIT', section: 'asset-recruit-tickets', label: t('overview.balances.recruitTickets'), value: status ? String(status.recruitLicense) : unavailable },
  ] satisfies readonly { itemIcon: Exclude<SummaryItemIcon, 'AP_GAMEPLAY'>; section: DashboardSummarySection; label: string; value: string }[];
  const operationMetrics = [
    { section: 'operation-map', label: t('overview.metrics.map'), title: stageTitle, subtitle: stageSubtitle },
    { section: 'operation-auto-battle', label: t('overview.metrics.autoBattle'), title: gameAccount.config.is_auto_battle ? tCommon('states.enabled') : tCommon('states.disabled') },
    { section: 'operation-base-arrange', label: t('overview.metrics.baseArrange'), title: gameAccount.config.enable_building_arrange ? tCommon('states.enabled') : tCommon('states.disabled') },
    { section: 'operation-keeping-ap', label: t('overview.metrics.keepingAp'), title: String(gameAccount.config.keeping_ap) },
  ] satisfies readonly { section: DashboardSummarySection; label: string; title: string; subtitle?: string | undefined }[];
  const maxAp = status?.maxAp ?? 0;
  const currentAp = status?.ap ?? gameAccount.ap;
  const isSanityAtCapacity = maxAp > 0 && currentAp >= maxAp;
  const serverLabel = gameAccount.platform === 1 ? t('overview.channels.official') : gameAccount.platform === 2 ? t('overview.channels.bilibili') : unavailable;

  return (
    <XStack testID="overview-summary-grid" flexWrap="wrap" items="flex-start" gap={20} pb="$4">
      <YStack width="100%" $xl={{ width: '65%' }}>
        <DashboardSummaryFrame
          activeSection={activeSection}
          label={t('overview.profile')}
          onActivate={setActiveSection}
          section="profile"
          testID="overview-profile-frame"
          p="$3.5"
          minH={166}
        >
          <YStack gap="$3">
            <TerminalSectionHeading code="01" title={formatDashboardSummaryTitle(t('overview.profile'))} trailing={<DecorativeBarcode />} />
            <XStack items="flex-end" justify="space-between" gap="$3">
              <YStack minW={0} grow={1} gap="$0.5">
                <MonoText size="$2">{gameAccount.statusText || unavailable}</MonoText>
                <TerminalText size="$6" fontWeight="800" numberOfLines={1}>{status?.nickName || gameAccount.nickname || gameAccount.account}</TerminalText>
                <MonoText size="$1" numberOfLines={1}>{gameAccount.account} · {serverLabel}</MonoText>
              </YStack>
              <YStack items="flex-end"><MonoText size="$1">{t('overview.level')}</MonoText><TerminalText size="$9" lineHeight="$9" fontWeight="900" color="$appAccent">{status?.level ?? gameAccount.level}</TerminalText></YStack>
            </XStack>
            <XStack items="center" justify="space-between">
              <MonoText size="$1">{t('overview.experience')} {unavailable}</MonoText>
              <XStack items="center" gap="$1"><Activity size={12} color={gameAccount.statusCode === ARK_HOST_GAME_STATUS_CODE.running ? colors.appSuccess.val : colors.appMuted.val} /><MonoText size="$1" color={gameAccount.statusCode === ARK_HOST_GAME_STATUS_CODE.running ? '$appSuccess' : '$appMuted'}>{gameAccount.statusText || unavailable}</MonoText></XStack>
            </XStack>
          </YStack>
        </DashboardSummaryFrame>
      </YStack>

      <YStack width="100%" $lg={{ width: '48%' }} $xl={{ width: '31.5%' }}>
        <DashboardSummaryFrame
          activeSection={activeSection}
          label={t('overview.sanity')}
          onActivate={setActiveSection}
          section="sanity"
          testID="overview-sanity-frame"
          p="$3.5"
          tone={isSanityAtCapacity ? 'warning' : 'default'}
        >
          <TerminalSectionHeading code="02" title={formatDashboardSummaryTitle(t('overview.sanity'))} />
          <YStack mt="$3" gap="$2">
            <XStack items="center" gap="$3" minW={0}>
              <ItemArtwork
                accessibilityLabel={t('overview.sanity')}
                layoutSize={layoutSize}
                recyclingKey="overview-AP_GAMEPLAY"
                source={SUMMARY_ITEM_IMAGES.AP_GAMEPLAY}
                testID="overview-sanity-image"
              />
              <YStack grow={1} shrink={1} minW={0} gap="$1">
                <XStack items="baseline" gap="$1" minW={0}>
                  <TerminalText
                    testID="overview-sanity-current"
                    size="$8"
                    fontWeight="800"
                    color={isSanityAtCapacity ? '$appWarning' : '$appAccent'}
                  >
                    {currentAp}
                  </TerminalText>
                  <MonoText size="$3" shrink={1}>/ {maxAp || unavailable}</MonoText>
                </XStack>
                <MonoText size="$1">{t('overview.sanityCurrent')}</MonoText>
              </YStack>
            </XStack>
            {maxAp > 0 ? <TerminalMeterBar value={currentAp} max={maxAp} tone={isSanityAtCapacity ? 'warning' : 'cyan'} /> : null}
            {isSanityAtCapacity ? (
              <XStack testID="overview-sanity-status-row" items="center" gap="$1.5" px="$2" py="$1" bg="$appWarningSoft">
                <TriangleAlert size={13} color={colors.appWarning.val} />
                <MonoText testID="overview-sanity-status" size="$1" color="$appWarning">{t('overview.overflow')}</MonoText>
              </XStack>
            ) : null}
          </YStack>
        </DashboardSummaryFrame>
      </YStack>

      <YStack width="100%" $lg={{ width: '48%' }} $xl={{ width: '31.5%' }}>
        <YStack gap="$2">
          <TerminalSectionHeading code="03" title={formatDashboardSummaryTitle(t('overview.assets'))} />
          <XStack flexWrap="wrap" gap="$2">
            {accountBalances.map((balance) => (
              <DashboardSummaryFrame
                key={balance.label}
                activeSection={activeSection}
                label={balance.label}
                onActivate={setActiveSection}
                section={balance.section}
                testID={`overview-balance-frame-${balance.itemIcon}`}
                width="48.7%"
                minW={140}
                grow={1}
                p="$3"
                flexDirection="row"
                items="center"
                gap="$3"
                $lg={{ width: '23.5%' }}
              >
                <ItemArtwork
                  accessibilityLabel={balance.label}
                  layoutSize={layoutSize}
                  recyclingKey={`overview-${balance.itemIcon}`}
                  source={SUMMARY_ITEM_IMAGES[balance.itemIcon]}
                  testID={`overview-balance-image-${balance.itemIcon}`}
                />
                <YStack grow={1} shrink={1} minW={0}>
                  <TerminalText size="$5" fontWeight="800">{balance.value}</TerminalText>
                  <MonoText size="$1">{balance.label}</MonoText>
                </YStack>
              </DashboardSummaryFrame>
            ))}
          </XStack>
        </YStack>
      </YStack>

      <YStack width="100%" $lg={{ width: '48%' }} $xl={{ width: '31.5%' }}>
        <YStack gap="$2">
          <TerminalSectionHeading code="04" title={formatDashboardSummaryTitle(t('overview.operationMetrics'))} />
          <XStack flexWrap="wrap" gap="$2">
            {operationMetrics.map((metric, index) => {
              return (
                <DashboardSummaryFrame
                  key={metric.section}
                  activeSection={activeSection}
                  label={metric.label}
                  onActivate={setActiveSection}
                  section={metric.section}
                  testID={`overview-operation-metric-frame-${index}`}
                  width="48.7%"
                  minW={140}
                  grow={1}
                  p="$3"
                  $lg={{ width: '23.5%' }}
                >
                  <MonoText size="$1" numberOfLines={1} ellipsizeMode="tail" minW={0} shrink={1}>{metric.label}</MonoText>
                  <TerminalText
                    testID={metric.section === 'operation-map' ? 'overview-operation-map-title' : undefined}
                    size="$5"
                    fontWeight="800"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    minW={0}
                    shrink={1}
                  >
                    {metric.title}
                  </TerminalText>
                  {metric.subtitle ? <MonoText testID="overview-operation-map-subtitle" size="$1" numberOfLines={1} ellipsizeMode="tail" minW={0} shrink={1}>{metric.subtitle}</MonoText> : null}
                </DashboardSummaryFrame>
              );
            })}
          </XStack>
        </YStack>
      </YStack>

      <YStack width="100%" $xl={{ width: '31.5%' }}>
        <DashboardSummaryFrame
          activeSection={activeSection}
          label={t('overview.base')}
          onActivate={setActiveSection}
          section="base"
          testID="overview-base-frame"
          p="$4"
          gap="$3"
        >
          <TerminalSectionHeading code="05" title={formatDashboardSummaryTitle(t('overview.base'))} />
          {[t('overview.baseMetrics.mood'), t('overview.baseMetrics.factoryLoad'), t('overview.baseMetrics.trainingLoad')].map((label) => <XStack key={label} justify="space-between"><MonoText size="$2">{label}</MonoText><TerminalText size="$2">{unavailable}</TerminalText></XStack>)}
        </DashboardSummaryFrame>
      </YStack>

      <GameLogsView
        activeSection={activeSection}
        entries={logs}
        onActivate={setActiveSection}
      />
    </XStack>
  );
}
