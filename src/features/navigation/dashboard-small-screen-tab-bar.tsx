import type { BottomTabBarProps } from 'expo-router/tabs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, XStack, YStack, getTokens } from 'tamagui';

import { MonoText } from '@/components';
import { dashboardNavigation } from './navigation-config';

const dashboardPages = Object.values(dashboardNavigation.pages)
  .sort((left, right) => left.sort - right.sort);

type DashboardSmallScreenTabBarProps = {
  navigation: {
    emit: (event: {
      canPreventDefault: true;
      target: string;
      type: 'tabPress';
    }) => { defaultPrevented: boolean };
    navigate: (name: string, params: object | undefined) => void;
  };
  reducedMotion: boolean;
  state: Pick<BottomTabBarProps['state'], 'index' | 'routes'>;
};

export function DashboardSmallScreenTabBar({
  navigation,
  reducedMotion,
  state,
}: DashboardSmallScreenTabBarProps) {
  const { t } = useTranslation('dashboard');
  const colors = getTokens().color;
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [navigationWidth, setNavigationWidth] = useState(0);
  const activeRoute = state.routes[state.index];
  const activeIndex = Math.max(0, dashboardPages.findIndex((page) => page.id === activeRoute?.name));
  const buttonWidth = Math.max(0, (navigationWidth - 16) / dashboardPages.length);
  const indicatorWidth = Math.max(0, buttonWidth - 16);
  const indicatorLeft = 16 + activeIndex * buttonWidth;

  const handleLayout = (event: LayoutChangeEvent) => {
    setNavigationWidth(event.nativeEvent.layout.width);
  };

  const handleSelect = (pageId: string) => {
    const route = state.routes.find((candidate) => candidate.name === pageId);
    if (!route) return;

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (route.key !== activeRoute?.key && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  return (
    <YStack
      testID="small-screen-bottom-navigation"
      display="flex"
      height={66 + bottomInset}
      shrink={0}
      position="relative"
      overflow="hidden"
      borderTopWidth={1}
      borderColor="$appBorder"
      bg="$appBackground"
      onLayout={handleLayout}
    >
      <XStack
        position="absolute"
        t={0}
        l={0}
        r={0}
        height={66}
        px="$2"
        py={6}
      >
        <YStack
          transition={reducedMotion ? '0ms' : 'quickLessBouncy'}
          position="absolute"
          t={6}
          l={indicatorLeft}
          width={indicatorWidth}
          height={2}
          bg="$appAccent"
          opacity={navigationWidth > 0 ? 1 : 0}
        />
        {dashboardPages.map((page) => {
          const isActive = page.id === activeRoute?.name;
          const Icon = page.icon;
          return (
            <Button
              key={page.id}
              unstyled
              grow={1}
              minW={0}
              py="$2"
              items="center"
              gap="$1"
              hoverStyle={{ bg: '$appAccentSoft' }}
              pressStyle={{ opacity: 0.7 }}
              onPress={() => handleSelect(page.id)}
              role="tab"
              aria-selected={isActive}
            >
              <Icon
                size={19}
                color={isActive ? colors.appAccent.val : colors.appMuted.val}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <MonoText
                size="$1"
                color={isActive ? '$appAccent' : '$appMuted'}
                numberOfLines={1}
              >
                {t(`navigation.sections.${page.id}.label`)}
              </MonoText>
            </Button>
          );
        })}
      </XStack>
    </YStack>
  );
}
