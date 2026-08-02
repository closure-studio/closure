import { Stack as DashboardStack } from 'expo-router/js-stack';
import { useReducedMotion } from 'react-native-reanimated';

import { DashboardProvider } from '@/features/dashboard';
import { getRouteScreenOptions } from '@/features/session';

export default function DashboardLayout() {
  const reducedMotion = useReducedMotion();

  return (
    <DashboardProvider>
      <DashboardStack screenOptions={getRouteScreenOptions(reducedMotion)} />
    </DashboardProvider>
  );
}
