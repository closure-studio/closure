import { Plus } from 'lucide-react-native';
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
  const reducedMotion = useReducedMotion();
  const scrollViewRef = useRef<ReactNativeScrollView>(null);
  const accountLayouts = useRef(new Map<string, HorizontalItemLayout>());
  const scrollOffset = useRef(0);
  const viewportWidth = useRef(0);

  const revealActiveGameAccount = useCallback(() => {
    const itemLayout = accountLayouts.current.get(activeGameAccountId);
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
  }, [activeGameAccountId, reducedMotion]);

  useEffect(() => {
    revealActiveGameAccount();
  }, [revealActiveGameAccount]);

  const handleViewportLayout = (event: LayoutChangeEvent) => {
    viewportWidth.current = event.nativeEvent.layout.width;
    revealActiveGameAccount();
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.current = event.nativeEvent.contentOffset.x;
  };

  const handleAccountLayout = (gameAccountId: string, event: LayoutChangeEvent) => {
    const { width, x } = event.nativeEvent.layout;
    accountLayouts.current.set(gameAccountId, { width, x });
    if (gameAccountId === activeGameAccountId) revealActiveGameAccount();
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
        value={activeGameAccountId}
        indicator={<NotchedSelectionIndicator />}
        px="$3.5"
        $md={{ px: '$5' }}
      >
        {gameAccounts.map((gameAccount) => (
          <SlidingSelection.Item
            key={gameAccount.id}
            value={gameAccount.id}
            onLayout={(event) => handleAccountLayout(gameAccount.id, event)}
          >
            <GameAccountButton gameAccount={gameAccount} isActive={gameAccount.id === activeGameAccountId} onPress={() => onSelectGameAccount(gameAccount.id)} />
          </SlidingSelection.Item>
        ))}
        <LinkGameAccountButton onPress={onLinkGameAccount} />
      </SlidingSelection>
    </ScrollView>
  );
}
