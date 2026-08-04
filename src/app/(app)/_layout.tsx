import { Redirect, usePathname, useRouter } from 'expo-router';
import { Stack as AppStack } from 'expo-router/js-stack';
import type { ComponentProps } from 'react';
import { useEffect } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { getTokens, useMedia } from 'tamagui';

import {
  getRouteScreenOptions,
  getScopeTransitionScreenOptions,
  useAuth,
  useSessionBackdrop,
} from '@/features/session';
import {
  getNavigationScope,
  NavigationLayout,
  NavigationScopeScreen,
} from '@/features/navigation';

type AppStackScreenLayout = NonNullable<ComponentProps<typeof AppStack>['screenLayout']>;

const renderNavigationScopeScreen: AppStackScreenLayout = ({ children, route }) => (
  <NavigationScopeScreen scope={route.name === 'settings' ? 'settings' : 'dashboard'}>
    {children}
  </NavigationScopeScreen>
);

export default function AppLayout() {
  const colors = getTokens().color;
  const media = useMedia();
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { authState, signOut } = useAuth();
  const { blurTarget, resetBackdropTint } = useSessionBackdrop();
  const isCompact = Boolean(media['max-md']);
  const screenOptions = isCompact
    ? getScopeTransitionScreenOptions(reducedMotion, {
        cardBackgroundColor: colors.terminalBg.val,
      })
    : getRouteScreenOptions(reducedMotion, { enableIosBackGesture: true });

  useEffect(() => {
    if (getNavigationScope(pathname) === 'settings') resetBackdropTint();
  }, [pathname, resetBackdropTint]);

  if (authState.status === 'unauthenticated' && pathname !== '/login') {
    return <Redirect href={{ pathname: '/login', params: { returnTo: pathname } }} />;
  }

  const handleLogout = () => {
    resetBackdropTint();
    router.replace('/login');
    signOut();
  };

  return (
    <NavigationLayout
      blurTarget={blurTarget}
      onLogout={handleLogout}
    >
      <AppStack
        screenLayout={renderNavigationScopeScreen}
        screenOptions={screenOptions}
      />
    </NavigationLayout>
  );
}
