import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  LayoutChangeEvent,
  LayoutRectangle,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView as ReactNativeScrollView,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
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

const SCROLL_EVENT_THROTTLE_MS = 16;

type HorizontalItemLayout = Pick<LayoutRectangle, 'width' | 'x'>;

export function resolveScrollOffsetToRevealItem({
  itemLayout,
  scrollOffset,
  viewportWidth,
}: {
  itemLayout: HorizontalItemLayout;
  scrollOffset: number;
  viewportWidth: number;
}): number | null {
  if (viewportWidth <= 0) return null;
  if (itemLayout.x < scrollOffset) return Math.max(0, itemLayout.x);

  const itemEnd = itemLayout.x + itemLayout.width;
  const viewportEnd = scrollOffset + viewportWidth;
  return itemEnd > viewportEnd ? Math.max(0, itemEnd - viewportWidth) : null;
}

function GameAccountButton({ gameAccount, isSelected, onPress }: { gameAccount: GameAccount; isSelected: boolean; onPress: () => void }) {
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
      onPress={onPress}
      aria-pressed={isSelected}
    >
      <XStack position="relative" z="$1" items="center" gap={10}>
        <YStack width={32} height={32} shrink={0} items="center" justify="center" bg="$appSurfaceStrong" borderWidth={1} borderColor={avatarTone}>
          <TerminalText size="$3" fontWeight="700" color={avatarColor}>{gameAccount.nickname.slice(0, 1).toUpperCase() || '?'}</TerminalText>
        </YStack>
        <YStack shrink={0}>
          <MonoText size="$2" lineHeight="$1" letterSpacing={0} color={isSelected ? '$appText' : '$appMuted'} fontWeight="600" numberOfLines={1}>{gameAccount.nickname || gameAccount.account}</MonoText>
          <MonoText size="$1" letterSpacing={0} textTransform="uppercase" numberOfLines={1}>{t('operators.accountLevel', { level: gameAccount.level })} · {gameAccount.statusText}</MonoText>
        </YStack>
        <YStack width={6} height={6} shrink={0} rounded="$10" bg={gameAccount.statusCode === ARK_HOST_GAME_STATUS_CODE.running ? '$appSuccess' : '$appMuted'} opacity={gameAccount.statusCode === ARK_HOST_GAME_STATUS_CODE.running ? 1 : 0.5} />
      </XStack>
    </NotchedButton>
  );
}

export function GameAccountSwitcher({ gameAccounts, selectedGameAccountId, onSelectGameAccount }: { gameAccounts: readonly GameAccount[]; selectedGameAccountId: string; onSelectGameAccount: (gameAccountId: string) => void }) {
  const reducedMotion = useReducedMotion();
  const scrollViewRef = useRef<ReactNativeScrollView>(null);
  const accountLayouts = useRef(new Map<string, HorizontalItemLayout>());
  const scrollOffset = useRef(0);
  const viewportWidth = useRef(0);

  const revealSelectedGameAccount = useCallback(() => {
    const itemLayout = accountLayouts.current.get(selectedGameAccountId);
    if (!itemLayout) return;

    const nextScrollOffset = resolveScrollOffsetToRevealItem({
      itemLayout,
      scrollOffset: scrollOffset.current,
      viewportWidth: viewportWidth.current,
    });
    if (nextScrollOffset === null) return;

    scrollOffset.current = nextScrollOffset;
    scrollViewRef.current?.scrollTo({
      animated: !reducedMotion,
      x: nextScrollOffset,
      y: 0,
    });
  }, [selectedGameAccountId, reducedMotion]);

  useEffect(() => {
    revealSelectedGameAccount();
  }, [revealSelectedGameAccount]);

  const handleViewportLayout = (event: LayoutChangeEvent) => {
    viewportWidth.current = event.nativeEvent.layout.width;
    revealSelectedGameAccount();
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.current = event.nativeEvent.contentOffset.x;
  };

  const handleAccountLayout = (gameAccountId: string, event: LayoutChangeEvent) => {
    const { width, x } = event.nativeEvent.layout;
    accountLayouts.current.set(gameAccountId, { width, x });
    if (gameAccountId === selectedGameAccountId) revealSelectedGameAccount();
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      mx="$-3.5"
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={SCROLL_EVENT_THROTTLE_MS}
      contentContainerStyle={{ pb: 1 }}
      onLayout={handleViewportLayout}
      onScroll={handleScroll}
      $md={{ mx: '$-5' }}
    >
      <SlidingSelection
        value={selectedGameAccountId}
        indicator={<NotchedSelectionIndicator />}
        px="$3.5"
        $md={{ px: '$5' }}
      >
        {gameAccounts.map((gameAccount) => (
          <SlidingSelection.Item
            key={gameAccount.account}
            value={gameAccount.account}
            onLayout={(event) => handleAccountLayout(gameAccount.account, event)}
          >
            <GameAccountButton gameAccount={gameAccount} isSelected={gameAccount.account === selectedGameAccountId} onPress={() => onSelectGameAccount(gameAccount.account)} />
          </SlidingSelection.Item>
        ))}
      </SlidingSelection>
    </ScrollView>
  );
}
