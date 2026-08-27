import { useTranslation } from 'react-i18next';

import { SettingsPagerTabs } from './components/settings-pager-tabs';
import { settingsDefaultPage, settingsPagesList } from './navigation-config';
import { useReturnToDashboard } from './navigation-actions';

type SettingsTabBarProps = {
  navigation: {
    jumpTo: (name: string) => void;
  };
  state: {
    index: number;
    routes: readonly { name: string }[];
  };
};

export function SettingsTabBar({ navigation, state }: SettingsTabBarProps) {
  const { t } = useTranslation('navigation');
  const onBack = useReturnToDashboard();
  const activeRoute = state.routes[state.index];
  const activeId = settingsPagesList.find((page) => page.id === activeRoute?.name)?.id
    ?? settingsDefaultPage.id;
  const items = settingsPagesList.map((page) => ({
    id: page.id,
    label: t(`pages.${page.id}.label`),
  }));

  const handleSelect = (pageId: string) => {
    if (pageId !== activeRoute?.name) navigation.jumpTo(pageId);
  };

  return (
    <SettingsPagerTabs
      activeId={activeId}
      backLabel={t('scopeSwitcher.returnToDashboard')}
      items={items}
      onBack={onBack}
      onSelect={handleSelect}
      swipeHint={t('smallScreen.swipeHint')}
      tabListLabel={t('smallScreen.settingsTabsLabel')}
    />
  );
}
