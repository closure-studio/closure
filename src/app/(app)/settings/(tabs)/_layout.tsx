import { TopTabs as SettingsTopTabs } from 'expo-router/js-top-tabs';
import { useMedia } from 'tamagui';

import {
  SettingsFrame,
  SettingsTabBar,
  settingsPagesList,
} from '@/features/navigation';

export default function SettingsTabsLayout() {
  const { large } = useMedia();

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
        tabBar={!large ? SettingsTabBar : () => null}
      >
        {settingsPagesList.map((page) => (
          <SettingsTopTabs.Screen key={page.id} name={page.id} />
        ))}
      </SettingsTopTabs>
    </SettingsFrame>
  );
}
