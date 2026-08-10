import { Stack as SettingsStack } from 'expo-router/js-stack';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMedia } from 'tamagui';

import { SettingsMockProvider } from '@/features/settings';
import { getRouteScreenOptions } from '@/features/session';

export default function SettingsLayout() {
  const media = useMedia();
  const reducedMotion = useReducedMotion();
  const isCompact = Boolean(media['max-md']);

  return (
    <SettingsMockProvider>
      <SafeAreaView
        edges={isCompact ? ['bottom'] : []}
        style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
      >
        <SettingsStack screenOptions={getRouteScreenOptions(reducedMotion)} />
      </SafeAreaView>
    </SettingsMockProvider>
  );
}
