import { Slot, useIsFocused, usePathname, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

import { HorizontalSwipeSurface } from '@/components';
import type { HorizontalSwipeDirection } from '@/components';
import {
  navigateBackToDashboard,
  SettingsPagerTabs,
  settingsNavigation,
} from '@/features/navigation';
import type { SettingsPageId } from '@/features/navigation';
import { ApiNodeMockProvider } from '@/features/settings';
import { useLayoutSize } from '@/providers/layout-size-provider';

const settingsPages = Object.values(settingsNavigation.pages)
  .sort((left, right) => left.sort - right.sort);

export default function SettingsLayout() {
  const { t } = useTranslation('navigation');
  const layoutSize = useLayoutSize();
  const isFocused = useIsFocused();
  const pathname = usePathname();
  const router = useRouter();
  const currentIndex = settingsPages.findIndex((page) => page.route === pathname);

  const handleSelectPage = useCallback((pageId: SettingsPageId) => {
    const page = settingsNavigation.pages[pageId];
    if (page.route !== pathname) router.replace(page.route);
  }, [pathname, router]);
  const handleSwipe = useCallback((direction: HorizontalSwipeDirection) => {
    const adjacentIndex = direction === 'left' ? currentIndex + 1 : currentIndex - 1;
    const adjacentPage = settingsPages[adjacentIndex];

    if (adjacentPage) {
      router.replace(adjacentPage.route);
      return;
    }

    if (direction === 'right' && currentIndex === 0) navigateBackToDashboard(router);
  }, [currentIndex, router]);
  const pagerItems = settingsPages.map((page) => ({
    id: page.id,
    label: t(`pages.${page.id}.label`),
  }));

  return (
    <ApiNodeMockProvider>
      <SafeAreaView
        edges={layoutSize === 'small' ? ['bottom'] : []}
        style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
      >
        <YStack grow={1} shrink={1} minH={0}>
          {layoutSize === 'small' && currentIndex >= 0 ? (
            <SettingsPagerTabs
              activeId={settingsPages[currentIndex]?.id ?? settingsNavigation.defaultPage.id}
              hasNextStep={currentIndex < settingsPages.length - 1}
              hasPreviousStep={currentIndex > 0}
              items={pagerItems}
              onSelect={handleSelectPage}
              swipeHint={t('smallScreen.swipeHint')}
              tabListLabel={t('smallScreen.settingsTabsLabel')}
            />
          ) : null}
          <HorizontalSwipeSurface
            canSwipeLeft={currentIndex >= 0 && currentIndex < settingsPages.length - 1}
            canSwipeRight={currentIndex >= 0}
            contentKey={pathname}
            enabled={isFocused && layoutSize === 'small'}
            onSwipe={handleSwipe}
          >
            <YStack grow={1} shrink={1} minH={0}>
              <Slot />
            </YStack>
          </HorizontalSwipeSurface>
        </YStack>
      </SafeAreaView>
    </ApiNodeMockProvider>
  );
}
