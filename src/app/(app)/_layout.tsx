import { Redirect, usePathname, useRouter } from 'expo-router';
import { Stack as AppStack } from 'expo-router/js-stack';
import { useReducedMotion } from 'react-native-reanimated';

import { ROUTES } from '@/constants/routes';
import {
  getRouteScreenOptions,
  getScopeTransitionScreenOptions,
  useSessionBackdrop,
} from '@/features/session';
import {
  NavigationLayout,
} from '@/features/navigation';
import { useLayoutSize } from '@/providers/layout-size-provider';
import { useAppStore } from '@/store';

export default function AppLayout() {
  const layoutSize = useLayoutSize();
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const logout = useAppStore((state) => state.logout);
  const session = useAppStore((state) => state.auth.session);
  const { resetBackdropTint } = useSessionBackdrop();
  const screenOptions = layoutSize === 'small'
    ? getScopeTransitionScreenOptions(reducedMotion)
    : getRouteScreenOptions(reducedMotion);

  if (!session) {
    return <Redirect href={{ pathname: ROUTES.login, params: { returnTo: pathname } }} />;
  }

  const handleLogout = () => {
    resetBackdropTint();
    router.replace(ROUTES.login);
    logout();
  };

  return (
    <NavigationLayout onLogout={handleLogout}>
      <AppStack
        screenOptions={screenOptions}
      />
    </NavigationLayout>
  );
}
