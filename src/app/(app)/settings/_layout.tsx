import { Stack as SettingsStack } from 'expo-router/js-stack';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsMockProvider } from '@/features/settings';
import { useUiSettings } from '@/providers/ui-settings-provider';
import { getRouteScreenOptions } from '@/features/session';

export default function SettingsLayout() {
  const { layoutSize } = useUiSettings();
  const reducedMotion = useReducedMotion();

  return (
    <SettingsMockProvider>
      <SafeAreaView
        edges={layoutSize === 'small' ? ['bottom'] : []}
        style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
      >
        <SettingsStack screenOptions={getRouteScreenOptions(reducedMotion)} />
      </SafeAreaView>
    </SettingsMockProvider>
  );
}
