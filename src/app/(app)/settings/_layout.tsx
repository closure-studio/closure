import { Tabs as SettingsTabs } from 'expo-router/tabs';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavigationLayout } from '@/features/navigation';
import { useLayoutSize } from '@/providers/layout-size-provider';

export default function SettingsLayout() {
  const layoutSize = useLayoutSize();
  const reducedMotion = useReducedMotion();

  return (
    <NavigationLayout gameAccount={null} scope="settings">
      <SafeAreaView
        edges={layoutSize === 'small' ? ['bottom'] : []}
        style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
      >
        <SettingsTabs
          screenOptions={{
            animation: reducedMotion ? 'none' : 'shift',
            freezeOnBlur: true,
            headerShown: false,
            lazy: true,
            sceneStyle: { backgroundColor: 'transparent' },
          }}
          tabBar={() => null}
        />
      </SafeAreaView>
    </NavigationLayout>
  );
}
