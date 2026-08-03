import { Stack as SettingsStack } from 'expo-router/js-stack';
import { useReducedMotion } from 'react-native-reanimated';

import { SettingsMockProvider } from '@/features/settings';
import { getRouteScreenOptions } from '@/features/session';

export default function SettingsLayout() {
  const reducedMotion = useReducedMotion();

  return (
    <SettingsMockProvider>
      <SettingsStack screenOptions={getRouteScreenOptions(reducedMotion)} />
    </SettingsMockProvider>
  );
}
