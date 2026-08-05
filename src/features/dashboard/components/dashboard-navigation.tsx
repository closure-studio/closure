import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Button, ScrollView, YStack, getTokens } from 'tamagui';

import { MonoText, SlidingSelection, TerminalText } from '@/components';
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
      <YStack position="absolute" t={0} b={0} l={0} r={0} bg="$appAccentSoft" opacity={0.5} />
      <YStack position="absolute" t={0} b={0} l={0} r={0} borderWidth={1} borderColor="$appAccentBorder" />
    </YStack>
  );
}

function GameAccountButton({ gameAccount, isActive, onPress }: { gameAccount: GameAccount; isActive: boolean; onPress: () => void }) {
  const { t } = useTranslation('dashboard');
  const avatarTone = gameAccount.color === 'warning'
    ? '$appWarningRing'
    : gameAccount.color === 'primary'
      ? '$appAccentRing'
      : '$appMutedRing';
  const avatarColor = gameAccount.color === 'warning'
    ? '$appWarning'
    : gameAccount.color === 'primary'
      ? '$appAccent'
      : '$appMuted';

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
      borderColor={isActive ? '$appAccentBorder' : '$appBorder'}
      bg="$appSurfaceRaised"
      hoverStyle={isActive ? null : { borderColor: '$appAccentBorder' }}
      pressStyle={{ opacity: 0.72 }}
      onPress={onPress}
      aria-pressed={isActive}
      $platform-web={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
    >
      <YStack width={32} height={32} shrink={0} items="center" justify="center" bg="$appSurfaceStrong" borderWidth={1} borderColor={avatarTone}>
        <TerminalText size="$3" fontWeight="700" color={avatarColor}>{gameAccount.avatar}</TerminalText>
      </YStack>
      <YStack shrink={0}>
        <MonoText size="$2" lineHeight="$1" letterSpacing={0} color={isActive ? '$appText' : '$appMuted'} fontWeight="600" numberOfLines={1}>{gameAccount.callsign}</MonoText>
        <MonoText size="$1" letterSpacing={0} textTransform="uppercase" numberOfLines={1}>{t('operators.accountLevel', { level: gameAccount.doctorLevel })} · {formatCompactNumber(gameAccount.orundum)} ♦</MonoText>
      </YStack>
      <YStack width={6} height={6} shrink={0} rounded="$10" bg={gameAccount.online === '在线' ? '$appSuccess' : '$appMuted'} opacity={gameAccount.online === '在线' ? 1 : 0.5} />
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
            borderColor="$appBorder"
            bg="$appSurfaceRaised"
            hoverStyle={{ borderColor: '$appAccentBorder' }}
            pressStyle={{ opacity: 0.72 }}
            onPress={onLinkGameAccount}
            aria-label={tDashboard('account.title')}
            $platform-web={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
          >
            <YStack width={32} height={32} items="center" justify="center" bg="$appSurfaceStrong"><Plus size={16} color={colors.appMuted.val} /></YStack>
            <MonoText size="$2" letterSpacing={0} fontWeight="600" color="$appMuted" textTransform="uppercase">{t('actions.add')}</MonoText>
          </Button>
        </SlidingSelection>
      </YStack>
    </ScrollView>
  );
}
