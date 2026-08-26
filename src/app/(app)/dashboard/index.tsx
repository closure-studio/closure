import { Redirect } from 'expo-router';

import { useGameAccountsQuery } from '@/features/dashboard';
import { dashboardPageHref } from '@/features/navigation';

export default function DashboardIndexRoute() {
  const gameAccountsQuery = useGameAccountsQuery();
  const firstGameAccount = gameAccountsQuery.data?.[0];

  if (!firstGameAccount) return null;
  return <Redirect href={dashboardPageHref('overview', firstGameAccount.account)} />;
}
