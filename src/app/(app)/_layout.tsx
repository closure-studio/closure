import { Redirect, usePathname } from 'expo-router';

import { ROUTES } from '@/constants/routes';
import { DashboardRouteProvider, useArkHostSync } from '@/features/dashboard';
import { AppScopeNavigator } from '@/features/navigation';
import { useAppStore } from '@/store';

export default function AppLayout() {
  const pathname = usePathname();
  const session = useAppStore((state) => state.auth.session);
  useArkHostSync();

  if (!session) {
    return <Redirect href={{ pathname: ROUTES.login, params: { returnTo: pathname } }} />;
  }

  return (
    <DashboardRouteProvider>
      <AppScopeNavigator />
    </DashboardRouteProvider>
  );
}
