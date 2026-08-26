import { Redirect } from 'expo-router';

import { useDashboardRoute } from '@/features/dashboard';
import { dashboardPageHref } from '@/features/navigation';

export default function DashboardIndexRoute() {
  const { gameAccounts } = useDashboardRoute();
  const firstGameAccount = gameAccounts[0];

  if (!firstGameAccount) return null;
  return <Redirect href={dashboardPageHref('overview', firstGameAccount.account)} />;
}
