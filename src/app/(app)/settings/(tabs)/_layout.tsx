import { TopTabs as SettingsTopTabs } from 'expo-router/js-top-tabs';

import {
  SettingsFrame,
  SettingsTabBar,
  settingsPagesList,
} from '@/features/navigation';
import { useLayoutSize } from '@/providers/layout-size-provider';

export default function SettingsTabsLayout() {
  const layoutSize = useLayoutSize();

  return (
    <SettingsFrame>
      <SettingsTopTabs
        screenOptions={{
          animationEnabled: true,
          lazy: true,
          lazyPreloadDistance: 1,
          sceneStyle: { backgroundColor: 'transparent' },
          swipeEnabled: true,
        }}
        tabBar={layoutSize === 'small' ? SettingsTabBar : () => null}
      >
        {settingsPagesList.map((page) => (
          <SettingsTopTabs.Screen key={page.id} name={page.id} />
        ))}
      </SettingsTopTabs>
    </SettingsFrame>
  );
}
