import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter } from 'expo-router';
import { YStack } from 'tamagui';

import {
  DashboardShell,
  getGameAvatarImageUrl,
  useDashboardRoute,
} from '@/features/dashboard';
import { NavigationFrame } from '../components/navigation-frame';
import { NavigationHeader } from '../components/navigation-header';
import {
  dashboardNavigation,
  dashboardPagesList,
  dashboardPageHref,
  getDashboardPageId,
  settingsNavigation,
} from '../navigation-config';
import { useAppLogout } from '../navigation-actions';

export function DashboardFrame({ children }: PropsWithChildren) {
  const { t } = useTranslation('navigation');
  const { t: tDashboard } = useTranslation('dashboard');
  const pathname = usePathname();
  const router = useRouter();
  const onLogout = useAppLogout();
  const { gameAccount, gameAccountId, gameAccounts } = useDashboardRoute();
  const activePageId = getDashboardPageId(pathname) ?? dashboardNavigation.defaultPage.id;
  const items = dashboardPagesList.map((page) => ({
    icon: page.icon,
    id: page.id,
    label: tDashboard(`navigation.sections.${page.id}.label`),
  }));

  const handleSelect = (pageId: string) => {
    const page = dashboardPagesList.find((candidate) => candidate.id === pageId);
    if (!page || !gameAccount || page.id === activePageId) return;
    router.replace(dashboardPageHref(page.id, gameAccount.account));
  };

  const handleOpenSettings = () => {
    router.push(settingsNavigation.defaultPage.route);
  };

  const handleSelectGameAccount = (nextGameAccountId: string) => {
    if (nextGameAccountId === gameAccountId) return;
    router.setParams({ gameAccountId: nextGameAccountId });
  };

  return (
    <NavigationFrame
      activeId={activePageId}
      header={(
        <YStack shrink={0} borderBottomWidth={1} borderColor="$appBorder">
          <NavigationHeader
            avatarLabel={t('smallScreen.avatarLabel')}
            avatarUrl={getGameAvatarImageUrl(gameAccount?.avatar)}
            isSettingsActive={false}
            onSettingsPress={handleOpenSettings}
            settingsLabel={t('scopeSwitcher.openSettings')}
            title={gameAccount?.nickname ?? ''}
          />
        </YStack>
      )}
      items={items}
      onLogout={onLogout}
      onSelect={handleSelect}
      onToggleScope={handleOpenSettings}
      scope="dashboard"
      smallScreenEdges={[]}
    >
      <DashboardShell
        gameAccounts={gameAccounts}
        onSelectGameAccount={handleSelectGameAccount}
        selectedGameAccountId={gameAccountId ?? ''}
      >
        {children}
      </DashboardShell>
    </NavigationFrame>
  );
}
