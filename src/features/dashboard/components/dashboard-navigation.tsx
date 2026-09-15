import { useTranslation } from 'react-i18next';
import { ScrollView, XStack, YStack } from 'tamagui';

import {
  MonoText,
  NotchedButton,
  NotchedSelectionIndicator,
  SlidingSelection,
  TerminalText,
} from '@/components';
import { ARK_HOST_GAME_STATUS_CODE } from '@/schemas/arkhost';
import type { GameAccount } from '@/schemas/game-account';

function GameAccountButton({
  gameAccount,
  isSelected,
  onSelectGameAccount,
}: {
  gameAccount: GameAccount;
  isSelected: boolean;
  onSelectGameAccount: (gameAccountId: string) => void;
}) {
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
      isSelected={isSelected}
      testID={`game-account-option-${gameAccount.account}`}
      height={50}
      px={12}
      py={8}
      flexDirection="row"
      items="center"
      justify="flex-start"
      onPress={() => onSelectGameAccount(gameAccount.account)}
      aria-pressed={isSelected}
    >
      <XStack position="relative" z="$1" items="center" gap={10}>
        <YStack width={32} height={32} shrink={0} items="center" justify="center" bg="$appSurfaceStrong" borderWidth={1} borderColor={avatarTone}>
          <TerminalText size="$3" fontWeight="700" color={avatarColor}>{gameAccount.nickname.slice(0, 1).toUpperCase() || '?'}</TerminalText>
        </YStack>
        <YStack shrink={0}>
          <MonoText size="$2" lineHeight="$1" letterSpacing={0} color={isSelected ? '$appText' : '$appMuted'} fontWeight="600" numberOfLines={1}>{gameAccount.nickname || gameAccount.account}</MonoText>
          <MonoText size="$1" letterSpacing={0} textTransform="uppercase" numberOfLines={1}>{t('operators.accountLevel', { level: gameAccount.level })}</MonoText>
        </YStack>
        <YStack width={6} height={6} shrink={0} rounded="$10" bg={gameAccount.statusCode === ARK_HOST_GAME_STATUS_CODE.running ? '$appSuccess' : '$appMuted'} opacity={gameAccount.statusCode === ARK_HOST_GAME_STATUS_CODE.running ? 1 : 0.5} />
      </XStack>
    </NotchedButton>
  );
}

export function GameAccountSwitcher({ gameAccounts, selectedGameAccountId, onSelectGameAccount }: { gameAccounts: readonly GameAccount[]; selectedGameAccountId: string; onSelectGameAccount: (gameAccountId: string) => void }) {
  return (
    <ScrollView
      mx="$-5"
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ pb: 1 }}
    >
      <SlidingSelection
        value={selectedGameAccountId}
        indicator={<NotchedSelectionIndicator />}
        px="$5"
      >
        {gameAccounts.map((gameAccount) => (
          <SlidingSelection.Item
            key={gameAccount.account}
            value={gameAccount.account}
          >
            <GameAccountButton
              gameAccount={gameAccount}
              isSelected={gameAccount.account === selectedGameAccountId}
              onSelectGameAccount={onSelectGameAccount}
            />
          </SlidingSelection.Item>
        ))}
      </SlidingSelection>
    </ScrollView>
  );
}
