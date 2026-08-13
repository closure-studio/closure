import { Tabs as DashboardTabs } from 'expo-router/tabs';
import { useIsFocused } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { Spinner, YStack, getTokens } from 'tamagui';

import { MonoText } from '@/components';
import { DashboardShell, selectBackdropTint } from '@/features/dashboard';
import { DashboardSmallScreenTabBar } from '@/features/navigation';
import { getTabScreenOptions, useSessionBackdrop } from '@/features/session';
import { useLayoutSize } from '@/providers/layout-size-provider';
import { selectActiveGameAccount, useAppStore } from '@/store';
import { resolveAdjacentHorizontalSwipeItem } from '@/utils/horizontal-swipe';
import type { HorizontalSwipeDirection } from '@/utils/horizontal-swipe';

function DashboardState({ label }: { label: string }) {
  return <YStack grow={1} items="center" justify="center" gap="$3"><Spinner color="$appAccent" /><MonoText size="$2">{label}</MonoText></YStack>;
}

function DashboardLayoutContent({ reducedMotion }: { reducedMotion: boolean }) {
  const colors = getTokens().color;
  const layoutSize = useLayoutSize();
  const isFocused = useIsFocused();
  const { setBackdropTint } = useSessionBackdrop();
  const activeGameAccount = useAppStore(selectActiveGameAccount);
  const gameAccounts = useAppStore((state) => state.games.data?.gameAccounts ?? []);
  const loadStatus = useAppStore((state) => state.games.loadStatus);
  const initializeGames = useAppStore((state) => state.initializeGames);
  const selectGameAccount = useAppStore((state) => state.selectGameAccount);
  const backdropTint = selectBackdropTint(activeGameAccount, { primary: colors.appAccent.val, warning: colors.appWarning.val, muted: colors.appMuted.val });

  useEffect(() => { setBackdropTint(backdropTint); }, [backdropTint, setBackdropTint]);
  useEffect(() => {
    initializeGames().catch((error: unknown) => {
      console.error('Unable to initialize ArkHost data.', error);
    });
  }, [initializeGames]);

  const activeGameAccountId = activeGameAccount?.account ?? '';
  const handleGameAccountSwipe = useCallback((direction: HorizontalSwipeDirection) => {
    const adjacentGameAccount = resolveAdjacentHorizontalSwipeItem({ activeId: activeGameAccountId, direction, items: gameAccounts.map((account) => ({ id: account.account })) });
    if (adjacentGameAccount) selectGameAccount(adjacentGameAccount.id);
  }, [activeGameAccountId, gameAccounts, selectGameAccount]);

  if (loadStatus === 'idle' || loadStatus === 'pending') return <DashboardState label="LOADING ARKHOST DATA" />;
  if (loadStatus === 'failed') return <DashboardState label="ARKHOST DATA UNAVAILABLE" />;
  if (!activeGameAccount) return <DashboardState label="NO GAME ACCOUNTS" />;

  return (
    <DashboardShell
      activeGameAccountId={activeGameAccountId}
      gameAccounts={gameAccounts}
      isContentSwipeEnabled={isFocused && layoutSize === 'small' && gameAccounts.length > 1}
      onContentSwipe={handleGameAccountSwipe}
      onSelectGameAccount={selectGameAccount}
    >
      <DashboardTabs
        detachInactiveScreens={process.env.EXPO_OS !== 'ios'}
        screenOptions={getTabScreenOptions(reducedMotion)}
        tabBar={layoutSize === 'small' ? (props) => <DashboardSmallScreenTabBar {...props} reducedMotion={reducedMotion} /> : () => null}
      >
        <DashboardTabs.Screen name="index" options={{ href: null }} />
      </DashboardTabs>
    </DashboardShell>
  );
}

export default function DashboardLayout() {
  return <DashboardLayoutContent reducedMotion={useReducedMotion()} />;
}
