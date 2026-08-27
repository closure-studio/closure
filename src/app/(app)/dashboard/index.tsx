import { Redirect } from 'expo-router';

import { dashboardDefaultPage } from '@/features/navigation';

export default function DashboardIndexRoute() {
  return <Redirect href={dashboardDefaultPage.route} />;
}
