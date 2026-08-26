import type { PropsWithChildren } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { HorizontalSwipeSurface } from '@/components';
import { ROUTES } from '@/constants/routes';
import { getGameAvatarImageUrl } from '@/features/dashboard';
import { useSessionBackdrop } from '@/features/session';
import { useLayoutSize } from '@/providers/layout-size-provider';
import type { GameAccount } from '@/schemas/game-account';
import { useAppStore } from '@/store';
import type { HorizontalSwipeDirection } from '@/utils/horizontal-swipe';
import { LargeScreenNavigationSidebar } from '../components/large-screen-navigation-sidebar';
import { NavigationHeader } from '../components/navigation-header';
import {
  SettingsPagerTabs,
  resolveSettingsSwipeAction,
} from '../components/settings-swipe-pager';
import {
  dashboardNavigation,
  dashboardPageHref,
  getDashboardPageId,
  settingsNavigation,
  sortedDashboardPages as dashboardPages,
  sortedSettingsPages as settingsPages,
} from '../navigation-config';
import type { NavigationScope } from '../navigation-config';

type NavigationLayoutProps = PropsWithChildren<{
  gameAccount: Pick<GameAccount, 'account' | 'avatar' | 'nickname'> | null;
  scope: NavigationScope;
}>;

export function NavigationLayout({
  children,
  gameAccount,
  scope,
}: NavigationLayoutProps) {
  const { t } = useTranslation('navigation');
  const { t: tDashboard } = useTranslation('dashboard');
  const layoutSize = useLayoutSize();
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAppStore((state) => state.logout);
  const { resetBackdropTint } = useSessionBackdrop();
  const matchedDashboardPageId = getDashboardPageId(pathname);
  const matchedDashboardPage = matchedDashboardPageId
    ? dashboardNavigation.pages[matchedDashboardPageId]
    : undefined;
  const matchedSettingsPage = settingsPages.find((page) => page.route === pathname);
  const activeDashboardPage = matchedDashboardPage ?? dashboardNavigation.defaultPage;
  const activeSettingsPage = matchedSettingsPage ?? settingsNavigation.defaultPage;
  const activePage = scope === 'dashboard' ? activeDashboardPage : activeSettingsPage;
  const headerTitle = scope === 'dashboard'
    ? (gameAccount?.nickname ?? '')
    : t(`pages.${activeSettingsPage.id}.label`);
  const isSettingsSwipeEnabled = scope === 'settings' && layoutSize === 'small';
  const handleExitSettings = useCallback(() => {
    router.replace(ROUTES.dashboard);
  }, [router]);

  const handleLogout = useCallback(() => {
    resetBackdropTint();
    logout();
    router.replace(ROUTES.login);
  }, [logout, resetBackdropTint, router]);

  const handleScopePress = useCallback(() => {
    if (scope === 'dashboard') {
      router.replace(settingsNavigation.defaultPage.route);
      return;
    }

    handleExitSettings();
  }, [handleExitSettings, router, scope]);

  const handleSelectSidebarPage = useCallback((pageId: string) => {
    if (scope === 'dashboard') {
      const page = dashboardPages.find((candidate) => candidate.id === pageId);
      if (!page || !gameAccount) return;
      if (page.id === matchedDashboardPageId) return;
      router.replace(dashboardPageHref(page.id, gameAccount.account));
      return;
    }

    const page = settingsPages.find((candidate) => candidate.id === pageId);
    if (page && page.route !== pathname) router.replace(page.route);
  }, [gameAccount, matchedDashboardPageId, pathname, router, scope]);

  const handleSettingsSwipe = useCallback((direction: HorizontalSwipeDirection) => {
    const action = resolveSettingsSwipeAction({
      activeId: activeSettingsPage.id,
      direction,
      items: settingsPages,
    });
    if (!action) return;

    if (action.type === 'exit') {
      handleExitSettings();
      return;
    }

    handleSelectSidebarPage(action.pageId);
  }, [activeSettingsPage.id, handleExitSettings, handleSelectSidebarPage]);

  const dashboardItems = dashboardPages.map((page) => ({
    icon: page.icon,
    id: page.id,
    label: tDashboard(`navigation.sections.${page.id}.label`),
  }));
  const settingsItems = settingsPages.map((page) => ({
    icon: page.icon,
    id: page.id,
    label: t(`pages.${page.id}.label`),
  }));
  const pageItems = scope === 'dashboard' ? dashboardItems : settingsItems;
  const activeSidebarId = activePage.id;

  return (
    <SafeAreaView
      edges={layoutSize === 'small' ? [] : ['bottom']}
      style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
    >
      <YStack grow={1} height="100%" maxH="100%" overflow="hidden">
        <XStack grow={1} shrink={1} minH={0}>
          <LargeScreenNavigationSidebar
            activeId={activeSidebarId}
            items={pageItems}
            onLogout={handleLogout}
            onSelect={handleSelectSidebarPage}
            onToggleScope={handleScopePress}
            scope={scope}
          />

          <HorizontalSwipeSurface
            enabled={isSettingsSwipeEnabled}
            onSwipe={handleSettingsSwipe}
          >
            <YStack grow={1} shrink={1} minW={0} minH={0}>
              <YStack testID="navigation-layout-header" shrink={0}>
                {layoutSize === 'small' && scope === 'settings' ? (
                  <SettingsPagerTabs
                    activeId={activeSettingsPage.id}
                    items={settingsItems}
                    onSelect={handleSelectSidebarPage}
                    swipeHint={t('smallScreen.swipeHint')}
                    tabListLabel={t('smallScreen.settingsTabsLabel')}
                  />
                ) : (
                  <YStack
                    shrink={0}
                    borderBottomWidth={1}
                    borderColor="$appBorder"
                  >
                    <NavigationHeader
                      avatarLabel={t('smallScreen.avatarLabel')}
                      avatarUrl={scope === 'dashboard'
                        ? getGameAvatarImageUrl(gameAccount?.avatar)
                        : null}
                      isSettingsActive={scope === 'settings'}
                      onSettingsPress={handleScopePress}
                      settingsLabel={t(scope === 'dashboard' ? 'scopeSwitcher.openSettings' : 'scopeSwitcher.returnToDashboard')}
                      title={headerTitle}
                    />
                  </YStack>
                )}
              </YStack>

              <YStack grow={1} shrink={1} minW={0} minH={0} overflow="hidden">
                <YStack grow={1} shrink={1} minH={0}>
                  {children}
                </YStack>
              </YStack>
            </YStack>
          </HorizontalSwipeSurface>
        </XStack>
      </YStack>
    </SafeAreaView>
  );
}
