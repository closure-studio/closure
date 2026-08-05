import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, XStack, YStack, getTokens } from 'tamagui';

import {
  MonoText,
  NotchedButton,
  NotchedSelectionIndicator,
  SlidingSelection,
  TerminalText,
} from '@/components';
import type { GameAccount } from '@/schemas/game-account';
import { formatCompactNumber } from '../utils';

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
    <NotchedButton
      isSelected={isActive}
      testID={`game-account-option-${gameAccount.id}`}
      height={50}
      px={12}
      py={8}
      flexDirection="row"
      items="center"
      justify="flex-start"
      onPress={onPress}
      aria-pressed={isActive}
    >
      <XStack position="relative" z="$1" items="center" gap={10}>
        <YStack width={32} height={32} shrink={0} items="center" justify="center" bg="$appSurfaceStrong" borderWidth={1} borderColor={avatarTone}>
          <TerminalText size="$3" fontWeight="700" color={avatarColor}>{gameAccount.avatar}</TerminalText>
        </YStack>
        <YStack shrink={0}>
          <MonoText size="$2" lineHeight="$1" letterSpacing={0} color={isActive ? '$appText' : '$appMuted'} fontWeight="600" numberOfLines={1}>{gameAccount.callsign}</MonoText>
          <MonoText size="$1" letterSpacing={0} textTransform="uppercase" numberOfLines={1}>{t('operators.accountLevel', { level: gameAccount.doctorLevel })} · {formatCompactNumber(gameAccount.orundum)} ♦</MonoText>
        </YStack>
        <YStack width={6} height={6} shrink={0} rounded="$10" bg={gameAccount.online === '在线' ? '$appSuccess' : '$appMuted'} opacity={gameAccount.online === '在线' ? 1 : 0.5} />
      </XStack>
    </NotchedButton>
  );
}

function LinkGameAccountButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation('common');
  const { t: tDashboard } = useTranslation('dashboard');
  const colors = getTokens().color;

  return (
    <NotchedButton
      dashed
      testID="link-game-account-option"
      height={50}
      px={12}
      py={8}
      flexDirection="row"
      items="center"
      onPress={onPress}
      aria-label={tDashboard('account.title')}
    >
      <XStack position="relative" z="$1" items="center" gap={8}>
        <YStack width={32} height={32} items="center" justify="center" bg="$appSurfaceStrong">
          <Plus size={16} color={colors.appMuted.val} />
        </YStack>
        <MonoText size="$2" letterSpacing={0} fontWeight="600" color="$appMuted" textTransform="uppercase">
          {t('actions.add')}
        </MonoText>
      </XStack>
    </NotchedButton>
  );
}

export function GameAccountSwitcher({ gameAccounts, activeGameAccountId, onSelectGameAccount, onLinkGameAccount }: { gameAccounts: readonly GameAccount[]; activeGameAccountId: string; onSelectGameAccount: (gameAccountId: string) => void; onLinkGameAccount: () => void }) {
  return (
    <ScrollView mx="$-3.5" horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ pb: 1 }} $md={{ mx: '$-5' }}>
      <YStack px="$3.5" $md={{ px: '$5' }}>
        <SlidingSelection value={activeGameAccountId} indicator={<NotchedSelectionIndicator />}>
          {gameAccounts.map((gameAccount) => (
            <SlidingSelection.Item key={gameAccount.id} value={gameAccount.id}>
              <GameAccountButton gameAccount={gameAccount} isActive={gameAccount.id === activeGameAccountId} onPress={() => onSelectGameAccount(gameAccount.id)} />
            </SlidingSelection.Item>
          ))}
          <LinkGameAccountButton onPress={onLinkGameAccount} />
        </SlidingSelection>
      </YStack>
    </ScrollView>
  );
}
