import { Redirect, usePathname } from 'expo-router';
import { Stack as AppStack } from 'expo-router/js-stack';
import { useReducedMotion } from 'react-native-reanimated';

import { getRouteScreenOptions, useAuth } from '@/features/session';

export default function AppLayout() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const { authState } = useAuth();

  if (authState.status === 'unauthenticated' && pathname !== '/login') {
    return <Redirect href={{ pathname: '/login', params: { returnTo: pathname } }} />;
  }

  return <AppStack screenOptions={getRouteScreenOptions(reducedMotion)} />;
}
