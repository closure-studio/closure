import { Redirect } from 'expo-router';

import { useDashboardAccount } from '@/features/dashboard';
import { dashboardDefaultPage, dashboardPageHref } from '@/features/navigation';

export default function DashboardIndexRoute() {
  const { gameAccountsQuery } = useDashboardAccount();
  const fallbackGameAccountId = gameAccountsQuery.data?.[0]?.account;

  if (!fallbackGameAccountId) return null;

  return (
    <Redirect
      href={dashboardPageHref(dashboardDefaultPage.id, fallbackGameAccountId)}
    />
  );
}
