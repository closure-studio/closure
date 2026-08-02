import { Redirect } from 'expo-router';

import { dashboardNavigation } from '@/features/navigation';

export default function DashboardIndexRoute() {
  return <Redirect href={dashboardNavigation.defaultPage.route} />;
}
