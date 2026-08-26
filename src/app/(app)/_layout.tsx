import { Redirect, Stack as AppStack, usePathname, useRouter } from 'expo-router';

import { ROUTES } from '@/constants/routes';
import {
  useSessionBackdrop,
} from '@/features/session';
import { NavigationLayout } from '@/features/navigation';
import { DashboardRouteProvider, useArkHostSync } from '@/features/dashboard';
import { useAppStore } from '@/store';

export default function AppLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAppStore((state) => state.logout);
  const session = useAppStore((state) => state.auth.session);
  const { resetBackdropTint } = useSessionBackdrop();
  useArkHostSync();

  if (!session) {
    return <Redirect href={{ pathname: ROUTES.login, params: { returnTo: pathname } }} />;
  }

  const handleLogout = () => {
    resetBackdropTint();
    logout();
    router.replace(ROUTES.login);
  };

  return (
    <DashboardRouteProvider>
      <NavigationLayout onLogout={handleLogout}>
        <AppStack
          screenOptions={{
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
            gestureEnabled: false,
            headerShown: false,
          }}
        />
      </NavigationLayout>
    </DashboardRouteProvider>
  );
}
