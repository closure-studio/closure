import { Slot } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLayoutSize } from '@/providers/layout-size-provider';

export default function SettingsLayout() {
  const layoutSize = useLayoutSize();

  return (
    <SafeAreaView
      edges={layoutSize === 'small' ? ['bottom'] : []}
      style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
    >
      <Slot />
    </SafeAreaView>
  );
}
