import { Tabs as DashboardTabs } from 'expo-router/tabs';
import { useIsFocused } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { Spinner, YStack, getTokens } from 'tamagui';

import { MonoText } from '@/components';
import {
  DashboardShell,
  selectBackdropTint,
  selectGameAccountById,
  useAdjacentGameAccountPrefetch,
  useGameAccountsQuery,
} from '@/features/dashboard';
import { DashboardSmallScreenTabBar } from '@/features/navigation';
import { useSessionBackdrop } from '@/features/session';
import { useLayoutSize } from '@/providers/layout-size-provider';
import { useAppStore } from '@/store';
import { resolveAdjacentHorizontalSwipeItem } from '@/utils/horizontal-swipe';
import type { HorizontalSwipeDirection } from '@/utils/horizontal-swipe';

function DashboardState({ label }: { label: string }) {
  return <YStack grow={1} items="center" justify="center" gap="$3"><Spinner color="$appAccent" /><MonoText size="$2">{label}</MonoText></YStack>;
}

export default function DashboardLayout() {
  const colors = getTokens().color;
  const layoutSize = useLayoutSize();
  const isFocused = useIsFocused();
  const { setBackdropTint } = useSessionBackdrop();
  const gameAccountsQuery = useGameAccountsQuery();
  const selectedGameAccountId = useAppStore((state) => state.selectedGameAccountId);
  const selectGameAccount = useAppStore((state) => state.selectGameAccount);
  const gameAccounts = useMemo(
    () => gameAccountsQuery.data ?? [],
    [gameAccountsQuery.data],
  );
  const selectedGameAccount = useMemo(
    () => selectGameAccountById(gameAccounts, selectedGameAccountId),
    [gameAccounts, selectedGameAccountId],
  );
  const backdropTint = selectBackdropTint(selectedGameAccount, { primary: colors.appAccent.val, warning: colors.appWarning.val, muted: colors.appMuted.val });

  useAdjacentGameAccountPrefetch(gameAccounts, selectedGameAccountId);

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
      selectedGameAccountId={selectedGameAccountId ?? ''}
      gameAccounts={gameAccounts}
      isContentSwipeEnabled={isFocused && layoutSize === 'small' && gameAccounts.length > 1}
      onContentSwipe={handleGameAccountSwipe}
      onSelectGameAccount={selectGameAccount}
    >
      <DashboardTabs
        screenOptions={{
          animation: 'none',
          freezeOnBlur: true,
          headerShown: false,
          lazy: true,
          sceneStyle: { backgroundColor: 'transparent' },
        }}
        tabBar={layoutSize === 'small' ? (props) => <DashboardSmallScreenTabBar {...props} /> : () => null}
      >
        <DashboardTabs.Screen name="index" options={{ href: null }} />
      </DashboardTabs>
    </DashboardShell>
  );
}
