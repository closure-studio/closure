import { Stack as SettingsStack } from 'expo-router/js-stack';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiNodeMockProvider } from '@/features/settings';
import { useLayoutSize } from '@/providers/layout-size-provider';
import { getRouteScreenOptions } from '@/features/session';

export default function SettingsLayout() {
  const layoutSize = useLayoutSize();
  const reducedMotion = useReducedMotion();

  return (
    <ApiNodeMockProvider>
      <SafeAreaView
        edges={layoutSize === 'small' ? ['bottom'] : []}
        style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
      >
        <SettingsStack screenOptions={getRouteScreenOptions(reducedMotion)} />
      </SafeAreaView>
    </ApiNodeMockProvider>
  );
}
