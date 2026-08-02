import { Redirect, usePathname, useRouter } from 'expo-router';
import { Stack as AppStack } from 'expo-router/js-stack';
import { useReducedMotion } from 'react-native-reanimated';

import { getRouteScreenOptions, useAuth, useSessionBackdrop } from '@/features/session';
import { NavigationLayout, NavigationProvider } from '@/features/navigation';

export default function AppLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { authState, signOut } = useAuth();
  const { blurTarget, resetBackdropTint } = useSessionBackdrop();

  if (authState.status === 'unauthenticated' && pathname !== '/login') {
    return <Redirect href={{ pathname: '/login', params: { returnTo: pathname } }} />;
  }

  const handleLogout = () => {
    resetBackdropTint();
    router.replace('/login');
    signOut();
  };

  return (
    <NavigationProvider>
      <NavigationLayout
        blurTarget={blurTarget}
        onLogout={handleLogout}
        onMatrixMode={resetBackdropTint}
      >
        <AppStack screenOptions={getRouteScreenOptions(reducedMotion)} />
      </NavigationLayout>
    </NavigationProvider>
  );
}
