import { Redirect, usePathname, useRouter } from 'expo-router';
import { Stack as AppStack } from 'expo-router/js-stack';
import { useReducedMotion } from 'react-native-reanimated';

import {
  getRouteScreenOptions,
  getScopeTransitionScreenOptions,
  useAuth,
  useSessionBackdrop,
} from '@/features/session';
import {
  NavigationLayout,
} from '@/features/navigation';
import { useUiSettings } from '@/providers/ui-settings-provider';

export default function AppLayout() {
  const { layoutSize } = useUiSettings();
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { authState, signOut } = useAuth();
  const { resetBackdropTint } = useSessionBackdrop();
  const screenOptions = layoutSize === 'small'
    ? getScopeTransitionScreenOptions(reducedMotion)
    : getRouteScreenOptions(reducedMotion, { enableIosBackGesture: true });

  if (authState.status !== 'authenticated') {
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
