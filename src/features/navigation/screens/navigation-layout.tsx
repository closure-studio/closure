import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter } from 'expo-router';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XStack, YStack, useMedia } from 'tamagui';

import { HorizontalSwipeScope } from '@/components';
import type { HorizontalSwipeDirection } from '@/components';
import { DesktopNavigationSidebar } from '../components/desktop-navigation-sidebar';
import { MobileBottomNavigation } from '../components/mobile-bottom-navigation';
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
const MOCK_PROFILE_AVATAR_URL = 'https://ark-resource.arknights.app/assets/avatar/ASSISTANT/char_003_kalts_sale_14.webp';
type DashboardPage = (typeof dashboardPages)[number];
type SettingsPage = (typeof settingsPages)[number];

type NavigationLayoutContextValue = {
  activeDashboardPageId: DashboardPage['id'];
  dashboardItems: { icon: DashboardPage['icon']; id: DashboardPage['id']; label: string }[];
  handleSelectDashboardPage: (pageId: string) => void;
  isCompact: boolean;
  reducedMotion: boolean;
};

const NavigationLayoutContext = createContext<NavigationLayoutContextValue | null>(null);

function useNavigationLayoutContext(): NavigationLayoutContextValue {
  const value = useContext(NavigationLayoutContext);
  if (!value) throw new Error('NavigationScopeScreen must be rendered inside NavigationLayout.');
  return value;
}

type NavigationLayoutProps = PropsWithChildren<{
  onLogout: () => void;
}>;

export function NavigationScopeScreen({
  children,
  scope,
}: PropsWithChildren<{ scope: 'dashboard' | 'settings' }>) {
  const {
    activeDashboardPageId,
    dashboardItems,
    handleSelectDashboardPage,
    isCompact,
    reducedMotion,
  } = useNavigationLayoutContext();

  if (!isCompact) return children;

  if (scope === 'settings') {
    return (
      <SafeAreaView edges={['bottom']} style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <YStack grow={1} shrink={1} minH={0} overflow="hidden">
          <YStack grow={1} shrink={1} minH={0}>{children}</YStack>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={[]} style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <YStack grow={1} shrink={1} minH={0} overflow="hidden">
        <YStack grow={1} shrink={1} minH={0}>{children}</YStack>
        <MobileBottomNavigation
          activeId={activeDashboardPageId}
          items={dashboardItems}
          onSelect={handleSelectDashboardPage}
          reducedMotion={reducedMotion}
        />
      </YStack>
    </SafeAreaView>
  );
}

export function NavigationLayout({ children, onLogout }: NavigationLayoutProps) {
  const { t } = useTranslation('navigation');
  const { t: tDashboard } = useTranslation('dashboard');
  const media = useMedia();
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const scope = getNavigationScope(pathname);
  const matchedDashboardPage = dashboardPages.find((page) => page.route === pathname);
  const matchedSettingsPage = settingsPages.find((page) => page.route === pathname);
  const [lastDashboardPage, setLastDashboardPage] = useState<DashboardPage>(
    matchedDashboardPage ?? dashboardNavigation.defaultPage,
  );
  const [lastSettingsPage, setLastSettingsPage] = useState<SettingsPage>(
    matchedSettingsPage ?? settingsNavigation.defaultPage,
  );
  const activeDashboardPage = matchedDashboardPage ?? lastDashboardPage;
  const activeSettingsPage = matchedSettingsPage ?? lastSettingsPage;
  const isCompact = Boolean(media['max-md']);
  const headerTitle = scope === 'dashboard'
    ? tDashboard(`navigation.sections.${activeDashboardPage.id}.label`)
    : t(`pages.${activeSettingsPage.id}.label`);
  const { enterSettings, returnToDashboard } = useSettingsBackNavigation({
    pathname,
    router,
    settingsRoute: activeSettingsPage.route,
  });

  const handleExitSettings = useCallback(() => {
    setLastSettingsPage(activeSettingsPage);
    returnToDashboard();
  }, [activeSettingsPage, returnToDashboard]);

  const handleScopePress = useCallback(() => {
    if (scope === 'dashboard') {
      setLastDashboardPage(activeDashboardPage);
      enterSettings(settingsNavigation.defaultPage.route);
      return;
    }

    handleExitSettings();
  }, [activeDashboardPage, enterSettings, handleExitSettings, scope]);

  useNavigationBackHandler(pathname, handleExitSettings);

  const handleSettingsSwipe = (direction: HorizontalSwipeDirection) => {
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
  };

  const handleSelectDashboardPage = (pageId: string) => {
    const page = dashboardPages.find((candidate) => candidate.id === pageId);
    if (page && page.route !== pathname) {
      setLastDashboardPage(page);
      router.replace(page.route);
    }
  };

  const handleSelectSettingsPage = (pageId: string) => {
    const page = settingsPages.find((candidate) => candidate.id === pageId);
    if (!page || page.route === pathname) return;

    setLastSettingsPage(page);
    router.replace(page.route);
  };

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

  const contextValue: NavigationLayoutContextValue = {
    activeDashboardPageId: activeDashboardPage.id,
    dashboardItems,
    handleSelectDashboardPage,
    isCompact,
    reducedMotion,
  };

  return (
    <NavigationLayoutContext.Provider value={contextValue}>
      <HorizontalSwipeScope
        active={scope === 'settings'}
        enabled={isCompact}
        name="settings-navigation"
        onSwipe={handleSettingsSwipe}
      />
      <SafeAreaView
        edges={isCompact ? [] : ['bottom']}
        style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
      >
        <YStack grow={1} height="100%" maxH="100%" overflow="hidden">
          <XStack grow={1} shrink={1} minH={0}>
            <DesktopNavigationSidebar
              activeId={activeSidebarId}
              items={sidebarItems}
              onLogout={onLogout}
              onSelect={handleSelectSidebarPage}
              onToggleScope={handleScopePress}
              scope={scope}
            />

            <YStack grow={1} shrink={1} minW={0} minH={0}>
              <YStack testID="navigation-layout-header" shrink={0}>
                {isCompact && scope === 'settings' ? (
                  <SettingsPagerTabs
                    activeId={activeSettingsPage.id}
                    items={settingsItems}
                    onSelect={handleSelectSettingsPage}
                    swipeHint={t('mobile.swipeHint')}
                    tabListLabel={t('mobile.settingsTabsLabel')}
                  />
                ) : (
                  <YStack
                    shrink={0}
                    borderBottomWidth={1}
                    borderColor="$appBorder"
                  >
                    <NavigationHeader
                      avatarLabel={t('mobile.avatarLabel')}
                      avatarUrl={MOCK_PROFILE_AVATAR_URL}
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
          </XStack>
        </YStack>
      </SafeAreaView>
    </NavigationLayoutContext.Provider>
  );
}
