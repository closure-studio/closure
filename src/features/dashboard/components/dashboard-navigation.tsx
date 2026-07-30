import { LogOut, Plus, Settings, Wifi } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Button, ScrollView, XStack, YStack, getTokens } from 'tamagui';

import { DecorativeBarcode, FlickeringStatusIndicator, MonoText, SlidingSelection, TerminalText } from '@/components';
import { dashboardSections } from '../navigation';
import type { DashboardSectionId } from '../navigation';
import type { GameAccount } from '@/schemas/game-account';
import { formatCompactNumber } from '../utils';

function GameAccountSelectionIndicator() {
  return (
    <YStack
      position="relative"
      width="100%"
      height="100%"
      overflow="hidden"
      $platform-web={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
    >
      <YStack position="absolute" t={0} b={0} l={0} r={0} bg="$terminalCyanSoft" opacity={0.5} />
      <YStack position="absolute" t={0} b={0} l={0} r={0} borderWidth={1} borderColor="$terminalCyanBorder" />
    </YStack>
  );
}

function GameAccountButton({ gameAccount, isActive, onPress }: { gameAccount: GameAccount; isActive: boolean; onPress: () => void }) {
  const { t } = useTranslation('dashboard');
  const avatarTone = gameAccount.color === 'warning'
    ? '$terminalWarningRing'
    : gameAccount.color === 'primary'
      ? '$terminalCyanRing'
      : '$terminalMutedRing';
  const avatarColor = gameAccount.color === 'warning'
    ? '$terminalWarning'
    : gameAccount.color === 'primary'
      ? '$terminalCyan'
      : '$terminalMuted';

  return (
    <Button
      unstyled
      height={50}
      shrink={0}
      px={12}
      py={8}
      flexDirection="row"
      items="center"
      justify="flex-start"
      gap={10}
      borderWidth={1}
      borderColor={isActive ? '$terminalCyanBorder' : '$terminalBorder'}
      bg="$terminalRaised"
      hoverStyle={isActive ? null : { borderColor: '$terminalCyanBorder' }}
      pressStyle={{ opacity: 0.72 }}
      onPress={onPress}
      aria-pressed={isActive}
      $platform-web={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
    >
      <YStack width={32} height={32} shrink={0} items="center" justify="center" bg="$terminalSurfaceStrong" borderWidth={1} borderColor={avatarTone}>
        <TerminalText size="$3" fontWeight="700" color={avatarColor}>{gameAccount.avatar}</TerminalText>
      </YStack>
      <YStack shrink={0}>
        <MonoText size="$2" lineHeight="$1" letterSpacing={0} color={isActive ? '$terminalText' : '$terminalMuted'} fontWeight="600" numberOfLines={1}>{gameAccount.callsign}</MonoText>
        <MonoText size="$1" letterSpacing={0} textTransform="uppercase" numberOfLines={1}>{t('operators.accountLevel', { level: gameAccount.doctorLevel })} · {formatCompactNumber(gameAccount.orundum)} ♦</MonoText>
      </YStack>
      <YStack width={6} height={6} shrink={0} rounded="$10" bg={gameAccount.online === '在线' ? '$terminalSuccess' : '$terminalMuted'} opacity={gameAccount.online === '在线' ? 1 : 0.5} />
    </Button>
  );
}

export function GameAccountSwitcher({ gameAccounts, activeGameAccountId, onSelectGameAccount, onLinkGameAccount }: { gameAccounts: readonly GameAccount[]; activeGameAccountId: string; onSelectGameAccount: (gameAccountId: string) => void; onLinkGameAccount: () => void }) {
  const { t } = useTranslation('common');
  const { t: tDashboard } = useTranslation('dashboard');
  const colors = getTokens().color;
  return (
    <ScrollView mx="$-3.5" horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ pb: 1 }} $md={{ mx: '$-5' }}>
      <YStack px="$3.5" $md={{ px: '$5' }}>
        <SlidingSelection value={activeGameAccountId} indicator={<GameAccountSelectionIndicator />}>
          {gameAccounts.map((gameAccount) => (
            <SlidingSelection.Item key={gameAccount.id} value={gameAccount.id}>
              <GameAccountButton gameAccount={gameAccount} isActive={gameAccount.id === activeGameAccountId} onPress={() => onSelectGameAccount(gameAccount.id)} />
            </SlidingSelection.Item>
          ))}
          <Button
            unstyled
            height={50}
            shrink={0}
            px={12}
            py={8}
            flexDirection="row"
            items="center"
            gap={8}
            borderWidth={1}
            borderStyle="dashed"
            borderColor="$terminalBorder"
            bg="$terminalRaised"
            hoverStyle={{ borderColor: '$terminalCyanBorder' }}
            pressStyle={{ opacity: 0.72 }}
            onPress={onLinkGameAccount}
            aria-label={tDashboard('account.title')}
            $platform-web={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
          >
            <YStack width={32} height={32} items="center" justify="center" bg="$terminalSurfaceStrong"><Plus size={16} color={colors.terminalMuted.val} /></YStack>
            <MonoText size="$2" letterSpacing={0} fontWeight="600" color="$terminalMuted" textTransform="uppercase">{t('actions.add')}</MonoText>
          </Button>
        </SlidingSelection>
      </YStack>
    </ScrollView>
  );
}

export function DesktopSidebar({
  activeSectionId,
  onSelectSection,
  onLogout,
  onOpenSettings,
}: {
  activeSectionId: DashboardSectionId;
  onSelectSection: (sectionId: DashboardSectionId) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}) {
  const { t } = useTranslation('common');
  const { t: tDashboard } = useTranslation('dashboard');
  const { t: tSettings } = useTranslation('settings');
  const colors = getTokens().color;
  return (
    <YStack display="none" width={224} shrink={0} borderRightWidth={1} borderColor="$terminalBorder" bg="$terminalSurface" $md={{ display: 'flex' }} $xl={{ width: 256 }}>
      <YStack px="$4.5" py="$4.5" gap="$2" borderBottomWidth={1} borderColor="$terminalBorder">
        <TerminalText size="$5" fontWeight="800" letterSpacing={2.8}>{tDashboard('navigation.brandTitle')}</TerminalText>
        <MonoText size="$1">{tDashboard('navigation.brandSubtitle')}</MonoText>
        <YStack mt="$1"><DecorativeBarcode /></YStack>
      </YStack>

      <YStack grow={1} px="$3" py="$4" gap="$1.5">
        {dashboardSections.map((section) => {
          const isActive = section.id === activeSectionId;
          const Icon = section.icon;
          return (
            <Button
              key={section.id}
              unstyled
              minH="$4.5"
              px="$3"
              py="$2"
              flexDirection="row"
              items="center"
              justify="flex-start"
              gap="$3"
              borderWidth={1}
              borderColor={isActive ? '$terminalCyanBorder' : 'transparent'}
              bg={isActive ? '$terminalCyanSoft' : 'transparent'}
              hoverStyle={{ borderColor: '$terminalBorder', bg: '$terminalRaised' }}
              pressStyle={{ opacity: 0.7 }}
              onPress={() => onSelectSection(section.id)}
              aria-pressed={isActive}
              $platform-web={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            >
              <Icon size={18} color={isActive ? colors.terminalCyan.val : colors.terminalMuted.val} strokeWidth={isActive ? 2 : 1.5} />
              <YStack gap={0}>
                <TerminalText size="$3" fontWeight={isActive ? '700' : '500'} color={isActive ? '$terminalCyan' : '$terminalMuted'}>{tDashboard(`navigation.sections.${section.id}.label`)}</TerminalText>
                <MonoText size="$1" color={isActive ? '$terminalCyan' : '$terminalMuted'}>{tDashboard(`navigation.sections.${section.id}.subtitle`)}</MonoText>
              </YStack>
            </Button>
          );
        })}
      </YStack>

      <YStack px="$4.5" py="$4" gap="$3" borderTopWidth={1} borderColor="$terminalBorder">
        <Button unstyled height="$4" px="$3" flexDirection="row" items="center" justify="flex-start" gap="$2" borderWidth={1} borderColor="$terminalBorder" hoverStyle={{ borderColor: '$terminalCyanBorder', bg: '$terminalCyanSoft' }} pressStyle={{ opacity: 0.7 }} onPress={onOpenSettings}>
          <Settings size={14} color={colors.terminalMuted.val} />
          <MonoText size="$2">{tSettings('navigationLabel')}</MonoText>
        </Button>
        <XStack items="center" gap="$2"><Wifi size={13} color={colors.terminalMuted.val} /><MonoText size="$1">{tDashboard('navigation.secureLink')}</MonoText><FlickeringStatusIndicator color={colors.terminalSuccess.val} /></XStack>
        <Button unstyled height="$4" px="$3" flexDirection="row" items="center" justify="center" gap="$2" borderWidth={1} borderColor="$terminalBorder" hoverStyle={{ borderColor: '$terminalWarningBorder', bg: '$terminalWarningSoft' }} pressStyle={{ opacity: 0.7 }} onPress={onLogout}>
          <LogOut size={14} color={colors.terminalMuted.val} />
          <MonoText size="$2">{t('actions.logoutTerminal')}</MonoText>
        </Button>
      </YStack>
    </YStack>
  );
}
