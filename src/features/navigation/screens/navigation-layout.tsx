import type { PropsWithChildren } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { HorizontalSwipeSurface } from '@/components';
import { getGameAvatarImageUrl, useSelectedGameAccount } from '@/features/dashboard';
import { useLayoutSize } from '@/providers/layout-size-provider';
import type { HorizontalSwipeDirection } from '@/utils/horizontal-swipe';
import { LargeScreenNavigationSidebar } from '../components/large-screen-navigation-sidebar';
import { NavigationHeader } from '../components/navigation-header';
import {
  SettingsPagerTabs,
  resolveSettingsSwipeAction,
} from '../components/settings-swipe-pager';
import {
  dashboardNavigation,
  getNavigationScope,
  settingsNavigation,
} from '../navigation-config';
import {
  useNavigationBackHandler,
  useSettingsBackNavigation,
} from '../back-navigation';

const dashboardPages = Object.values(dashboardNavigation.pages).sort((left, right) => left.sort - right.sort);
const settingsPages = Object.values(settingsNavigation.pages).sort((left, right) => left.sort - right.sort);

type NavigationLayoutProps = PropsWithChildren<{
  onLogout: () => void;
}>;

export function NavigationLayout({ children, onLogout }: NavigationLayoutProps) {
  const { t } = useTranslation('navigation');
  const { t: tDashboard } = useTranslation('dashboard');
  const layoutSize = useLayoutSize();
  const pathname = usePathname();
  const router = useRouter();
  const scope = getNavigationScope(pathname);
  const matchedDashboardPage = dashboardPages.find((page) => page.route === pathname);
  const matchedSettingsPage = settingsPages.find((page) => page.route === pathname);
  const activeDashboardPage = matchedDashboardPage ?? dashboardNavigation.defaultPage;
  const activeSettingsPage = matchedSettingsPage ?? settingsNavigation.defaultPage;
  const selectedGameAccount = useSelectedGameAccount();
  const headerTitle = scope === 'dashboard'
    ? (selectedGameAccount?.nickname ?? '')
    : t(`pages.${activeSettingsPage.id}.label`);
  const isSettingsSwipeEnabled = scope === 'settings' && layoutSize === 'small';
  const { enterSettings, returnToDashboard } = useSettingsBackNavigation({
    pathname,
    router,
    settingsRoute: activeSettingsPage.route,
  });

  const handleExitSettings = useCallback(() => {
    returnToDashboard();
  }, [returnToDashboard]);

  const handleScopePress = useCallback(() => {
    if (scope === 'dashboard') {
      enterSettings(settingsNavigation.defaultPage.route);
      return;
    }

    handleExitSettings();
  }, [enterSettings, handleExitSettings, scope]);

  useNavigationBackHandler(pathname, handleExitSettings);

  const handleSelectDashboardPage = (pageId: string) => {
    const page = dashboardPages.find((candidate) => candidate.id === pageId);
    if (page && page.route !== pathname) router.replace(page.route);
  };

  const handleSelectSettingsPage = useCallback((pageId: string) => {
    const page = settingsPages.find((candidate) => candidate.id === pageId);
    if (!page || page.route === pathname) return;

    router.replace(page.route);
  }, [pathname, router]);

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

    handleSelectSettingsPage(action.pageId);
  }, [activeSettingsPage.id, handleExitSettings, handleSelectSettingsPage]);

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
  const sidebarItems = scope === 'dashboard' ? dashboardItems : settingsItems;
  const activeSidebarId = scope === 'dashboard' ? activeDashboardPage.id : activeSettingsPage.id;
  const handleSelectSidebarPage = scope === 'dashboard'
    ? handleSelectDashboardPage
    : handleSelectSettingsPage;

  return (
    <SafeAreaView
      edges={layoutSize === 'small' ? [] : ['bottom']}
      style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
    >
      <YStack grow={1} height="100%" maxH="100%" overflow="hidden">
        <XStack grow={1} shrink={1} minH={0}>
          <LargeScreenNavigationSidebar
            activeId={activeSidebarId}
            items={sidebarItems}
            onLogout={onLogout}
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
                    onSelect={handleSelectSettingsPage}
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
                        ? getGameAvatarImageUrl(selectedGameAccount?.avatar)
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
