import { Stack as RootStack } from 'expo-router/js-stack';
import { useEffect } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import {
  getRouteScreenOptions,
  SessionShell,
} from '@/features/session';
import { AppProvider } from '@/providers';
import { useAppStore } from '@/store';

export default function RootLayout() {
  return (
    <AppProvider>
      <SessionShell>
        <RootNavigator />
      </SessionShell>
    </AppProvider>
  );
}

function RootNavigator() {
  const initializeGameResources = useAppStore((state) => state.initializeGameResources);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    initializeGameResources().catch((error: unknown) => {
      console.error('Unable to update game resources.', error);
    });
  }, [initializeGameResources]);

  return (
    <RootStack screenOptions={getRouteScreenOptions(reducedMotion)}>
      <RootStack.Screen name="(auth)" />
      <RootStack.Screen name="(app)" />
    </RootStack>
  );
}
