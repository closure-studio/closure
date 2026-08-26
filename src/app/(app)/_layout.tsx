import { Redirect, usePathname, useRouter } from 'expo-router';
import { Tabs as AppTabs } from 'expo-router/tabs';
import { useCallback } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { ROUTES } from '@/constants/routes';
import { useArkHostSync } from '@/features/dashboard';
import { useNavigationBackHandler } from '@/features/navigation';
import { useAppStore } from '@/store';

export default function AppLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useAppStore((state) => state.auth.session);
  const reducedMotion = useReducedMotion();
  useArkHostSync();

  const handleExitSettings = useCallback(() => {
    router.replace(ROUTES.dashboard);
  }, [router]);

  useNavigationBackHandler(pathname, handleExitSettings);

  if (!session) {
    return <Redirect href={{ pathname: ROUTES.login, params: { returnTo: pathname } }} />;
  }

  return (
    <AppTabs
      initialRouteName="dashboard"
      screenOptions={{
        animation: reducedMotion ? 'none' : 'shift',
        freezeOnBlur: true,
        headerShown: false,
        lazy: true,
        sceneStyle: { backgroundColor: 'transparent' },
      }}
      tabBar={() => null}
    />
  );
}
