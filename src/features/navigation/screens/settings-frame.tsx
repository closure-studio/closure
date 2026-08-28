import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter } from 'expo-router';
import { YStack, useMedia } from 'tamagui';
import { NavigationFrame } from '../components/navigation-frame';
import { NavigationHeader } from '../components/navigation-header';
import {
  getSettingsPageId,
  settingsDefaultPage,
  settingsPagesList,
} from '../navigation-config';
import { useAppLogout, useReturnToDashboard } from '../navigation-actions';

export function SettingsFrame({ children }: PropsWithChildren) {
  const { t } = useTranslation('navigation');
  const { large } = useMedia();
  const pathname = usePathname();
  const router = useRouter();
  const onLogout = useAppLogout();
  const handleReturnToDashboard = useReturnToDashboard();
  const activePageId = getSettingsPageId(pathname) ?? settingsDefaultPage.id;
  const items = settingsPagesList.map((page) => ({
    icon: page.icon,
    id: page.id,
    label: t(`pages.${page.id}.label`),
  }));

  const handleSelect = (pageId: string) => {
    const page = settingsPagesList.find((candidate) => candidate.id === pageId);
    if (page && page.id !== activePageId) router.navigate(page.route);
  };

  const header = large ? (
    <YStack shrink={0} borderBottomWidth={1} borderColor="$appBorder">
      <NavigationHeader
        avatarLabel={t('smallScreen.avatarLabel')}
        avatarUrl={null}
        isSettingsActive
        onSettingsPress={handleReturnToDashboard}
        settingsLabel={t('scopeSwitcher.returnToDashboard')}
        title={t(`pages.${activePageId}.label`)}
      />
    </YStack>
  ) : undefined;

  return (
    <NavigationFrame
      activeId={activePageId}
      header={header}
      items={items}
      onLogout={onLogout}
      onSelect={handleSelect}
      onToggleScope={handleReturnToDashboard}
      scope="settings"
      smallScreenEdges={['bottom']}
    >
      {children}
    </NavigationFrame>
  );
}
