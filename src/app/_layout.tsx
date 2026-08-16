import { Stack as RootStack } from 'expo-router/js-stack';
import { useReducedMotion } from 'react-native-reanimated';

import {
  getRouteScreenOptions,
  SessionShell,
} from '@/features/session';
import { useSessionQueryCacheReset } from '@/features/dashboard';
import { AppProvider } from '@/providers';

export default function RootLayout() {
  return (
    <AppProvider>
      <SessionQueryCacheReset />
      <SessionShell>
        <RootNavigator />
      </SessionShell>
    </AppProvider>
  );
}

function SessionQueryCacheReset() {
  useSessionQueryCacheReset();
  return null;
}

function RootNavigator() {
  const reducedMotion = useReducedMotion();

  return (
    <RootStack screenOptions={getRouteScreenOptions(reducedMotion)}>
      <RootStack.Screen name="(auth)" />
      <RootStack.Screen name="(app)" />
    </RootStack>
  );
}
