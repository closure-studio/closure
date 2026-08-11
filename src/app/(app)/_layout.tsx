import { Redirect, usePathname, useRouter } from 'expo-router';
import { Stack as AppStack } from 'expo-router/js-stack';
import { useReducedMotion } from 'react-native-reanimated';

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
  const authStatus = useAppStore((state) => state.user.status);
  const signOut = useAppStore((state) => state.signOut);
  const { resetBackdropTint } = useSessionBackdrop();
  const screenOptions = layoutSize === 'small'
    ? getScopeTransitionScreenOptions(reducedMotion)
    : getRouteScreenOptions(reducedMotion, { enableIosBackGesture: true });

  if (authStatus !== 'authenticated') {
    return <Redirect href={{ pathname: '/login', params: { returnTo: pathname } }} />;
  }

  const handleLogout = () => {
    resetBackdropTint();
    router.replace('/login');
    signOut();
  };

  return (
    <NavigationLayout onLogout={handleLogout}>
      <AppStack
        screenOptions={screenOptions}
      />
    </NavigationLayout>
  );
}
