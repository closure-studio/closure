import { Stack as RootStack } from 'expo-router/js-stack';
import { useReducedMotion } from 'react-native-reanimated';

import {
  AuthProvider,
  getRouteScreenOptions,
  SessionShell,
} from '@/features/session';
import { AppProvider } from '@/providers';

export default function RootLayout() {
  return (
    <AppProvider>
      <AuthProvider>
        <SessionShell>
          <RootNavigator />
        </SessionShell>
      </AuthProvider>
    </AppProvider>
  );
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
