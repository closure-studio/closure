import { Redirect } from 'expo-router';

import { dashboardDefaultPageId, dashboardPageHref } from '@/features/navigation';

export default function DashboardIndexRoute() {
  return <Redirect href={dashboardPageHref(dashboardDefaultPageId)} />;
}
