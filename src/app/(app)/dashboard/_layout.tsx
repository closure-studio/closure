import { Slot, usePathname, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner, YStack } from 'tamagui';

import { MonoText } from '@/components';
import { ROUTES } from '@/constants/routes';
import {
  DashboardAccountProvider,
  useDashboardAccount,
} from '@/features/dashboard';
import {
  DashboardFrame,
  dashboardDefaultPage,
  dashboardPageHref,
  getDashboardPageId,
} from '@/features/navigation';

function DashboardState({ labelKey }: { labelKey: 'loading' | 'unavailable' | 'empty' }) {
  const { t } = useTranslation('dashboard');

  return (
    <YStack grow={1} items="center" justify="center" gap="$3">
      <Spinner color="$appAccent" />
      <MonoText size="$2">{t(`states.${labelKey}`)}</MonoText>
    </YStack>
  );
}

function DashboardContent({ pathname }: { pathname: string }) {
  const {
    gameAccountsQuery,
    routeGameAccountId,
    selectedGameAccount,
    selectGameAccount,
  } = useDashboardAccount();
  const gameAccounts = gameAccountsQuery.data ?? [];
  const fallbackGameAccountId = gameAccounts[0]?.account;
  const shouldSelectFallback = pathname === ROUTES.dashboard
    || routeGameAccountId !== null;

  useEffect(() => {
    if (!selectedGameAccount && fallbackGameAccountId && shouldSelectFallback) {
      selectGameAccount(fallbackGameAccountId);
    }
  }, [
    fallbackGameAccountId,
    selectedGameAccount,
    selectGameAccount,
    shouldSelectFallback,
  ]);

  if (gameAccountsQuery.isPending) return <DashboardState labelKey="loading" />;
  if (gameAccountsQuery.isError) return <DashboardState labelKey="unavailable" />;
  if (gameAccounts.length === 0) return <DashboardState labelKey="empty" />;

  if (!selectedGameAccount) return null;

  return (
    <DashboardFrame>
      <Slot />
    </DashboardFrame>
  );
}

export default function DashboardLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const handleSelectGameAccount = useCallback((gameAccountId: string) => {
    const pageId = getDashboardPageId(pathname);
    if (pageId) {
      router.setParams({ gameAccountId });
      return;
    }

    router.replace(dashboardPageHref(dashboardDefaultPage.id, gameAccountId));
  }, [pathname, router]);

  return (
    <DashboardAccountProvider onSelectGameAccount={handleSelectGameAccount}>
      <DashboardContent pathname={pathname} />
    </DashboardAccountProvider>
  );
}
