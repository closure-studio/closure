import { Tabs as DashboardTabs } from 'expo-router/tabs';
import { useIsFocused } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { Spinner, YStack, getTokens } from 'tamagui';

import { MonoText } from '@/components';
import {
  DashboardShell,
  selectBackdropTint,
  useGameAccountsQuery,
  useSelectedGameAccount,
} from '@/features/dashboard';
import { DashboardSmallScreenTabBar } from '@/features/navigation';
import { getTabScreenOptions, useSessionBackdrop } from '@/features/session';
import { useLayoutSize } from '@/providers/layout-size-provider';
import { useAppStore } from '@/store';
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
  const gameAccountsQuery = useGameAccountsQuery();
  const selectedGameAccount = useSelectedGameAccount();
  const selectedGameAccountId = useAppStore((state) => state.selectedGameAccountId);
  const selectGameAccount = useAppStore((state) => state.selectGameAccount);
  const gameAccounts = useMemo(
    () => gameAccountsQuery.data ?? [],
    [gameAccountsQuery.data],
  );
  const backdropTint = selectBackdropTint(selectedGameAccount, { primary: colors.appAccent.val, warning: colors.appWarning.val, muted: colors.appMuted.val });

  useEffect(() => {
    if (!gameAccountsQuery.isSuccess) return;
    if (selectedGameAccountId !== null
      && gameAccounts.some((account) => account.account === selectedGameAccountId)
    ) return;
    selectGameAccount(gameAccounts[0]?.account ?? null);
  }, [gameAccounts, gameAccountsQuery.isSuccess, selectedGameAccountId, selectGameAccount]);

  useEffect(() => { setBackdropTint(backdropTint); }, [backdropTint, setBackdropTint]);

  const handleGameAccountSwipe = useCallback((direction: HorizontalSwipeDirection) => {
    const adjacentGameAccount = resolveAdjacentHorizontalSwipeItem({ activeId: selectedGameAccountId ?? '', direction, items: gameAccounts.map((account) => ({ id: account.account })) });
    if (adjacentGameAccount) selectGameAccount(adjacentGameAccount.id);
  }, [gameAccounts, selectGameAccount, selectedGameAccountId]);

  if (gameAccountsQuery.isPending) return <DashboardState label="LOADING ARKHOST DATA" />;
  if (gameAccountsQuery.isError) return <DashboardState label="ARKHOST DATA UNAVAILABLE" />;
  if (gameAccounts.length === 0) return <DashboardState label="NO GAME ACCOUNTS" />;
  if (!selectedGameAccount) return <DashboardState label="LOADING ARKHOST DATA" />;

  return (
    <DashboardShell
      isContentSwipeEnabled={isFocused && layoutSize === 'small' && gameAccounts.length > 1}
      onContentSwipe={handleGameAccountSwipe}
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
