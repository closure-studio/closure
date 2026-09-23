import type { BottomTabBarProps } from 'expo-router/tabs';
import { Plus } from 'lucide-react-native';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, XStack, YStack, getTokens } from 'tamagui';

import { MonoText } from '@/components';
import { dashboardPages } from './navigation-config';

const ACCOUNT_HALO_DURATION_MS = 2_800;
const ACCOUNT_HALO_MIN_OPACITY = 0.18;
const ACCOUNT_HALO_MAX_OPACITY = 0.42;
const ACCOUNT_HALO_MIN_SCALE = 1;
const ACCOUNT_HALO_MAX_SCALE = 1.045;
const ACCOUNT_HALO_REDUCED_MOTION_OPACITY = 0.22;
const ACCOUNT_HALO_REDUCED_MOTION_SCALE = 1.02;

export function DashboardSmallScreenTabBar({
  canCreateGame,
  navigation,
  onAddGameAccount,
  state,
}: BottomTabBarProps & {
  canCreateGame: boolean;
  onAddGameAccount: () => void;
}) {
  const { t } = useTranslation('dashboard');
  const colors = getTokens().color;
  const reducedMotion = useReducedMotion();
  const accountHaloProgress = useSharedValue(0);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [navigationWidth, setNavigationWidth] = useState(0);
  const activeRoute = state.routes[state.index];
  const activePageIndex = Math.max(0, dashboardPages.findIndex((page) => page.id === activeRoute?.name));
  const activeVisualIndex = activePageIndex >= 2 ? activePageIndex + 1 : activePageIndex;
  const itemCount = dashboardPages.length + 1;
  const buttonWidth = Math.max(0, (navigationWidth - 16) / itemCount);
  const indicatorWidth = Math.max(0, buttonWidth - 16);
  const indicatorLeft = 16 + activeVisualIndex * buttonWidth;

  useEffect(() => {
    cancelAnimation(accountHaloProgress);
    accountHaloProgress.set(0);

    if (canCreateGame && !reducedMotion) {
      accountHaloProgress.set(withRepeat(
        withTiming(1, {
          duration: ACCOUNT_HALO_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ));
    }

    return () => cancelAnimation(accountHaloProgress);
  }, [accountHaloProgress, canCreateGame, reducedMotion]);

  const accountHaloStyle = useAnimatedStyle(() => {
    if (!canCreateGame) return { opacity: 0 };

    if (reducedMotion) {
      return {
        opacity: ACCOUNT_HALO_REDUCED_MOTION_OPACITY,
        transform: [{ scale: ACCOUNT_HALO_REDUCED_MOTION_SCALE }],
      };
    }

    return {
      opacity: ACCOUNT_HALO_MIN_OPACITY
        + accountHaloProgress.value * (ACCOUNT_HALO_MAX_OPACITY - ACCOUNT_HALO_MIN_OPACITY),
      transform: [{
        scale: ACCOUNT_HALO_MIN_SCALE
          + accountHaloProgress.value * (ACCOUNT_HALO_MAX_SCALE - ACCOUNT_HALO_MIN_SCALE),
      }],
    };
  });

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
      overflow="visible"
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
        {dashboardPages.map((page, index) => {
          const isActive = page.id === activeRoute?.name;
          const Icon = page.icon;
          return (
            <Fragment key={page.id}>
              {index === 2 ? (
                <YStack
                  grow={1}
                  flexBasis={0}
                  minW={0}
                  items="center"
                  justify="center"
                  overflow="visible"
                >
                  <YStack
                    position="relative"
                    width={68}
                    height={68}
                    mt={-16}
                    items="center"
                    justify="center"
                    rounded="$12"
                    bg={canCreateGame ? '$appAccentSoft' : '$appSurfaceRaisedTranslucent'}
                    borderWidth={1}
                    borderColor={canCreateGame ? '$appAccentBorder' : '$appBorder'}
                    opacity={canCreateGame ? 1 : 0.55}
                    transition={reducedMotion ? '0ms' : 'quickLessBouncy'}
                  >
                    <Animated.View
                      testID="dashboard-add-game-account-halo"
                      style={[
                        {
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          borderRadius: 50,
                          borderWidth: 1,
                          borderColor: colors.appAccentBorder.val,
                          backgroundColor: colors.appAccentSoft.val,
                          pointerEvents: 'none',
                        },
                        accountHaloStyle,
                      ]}
                    />
                    <Button
                      unstyled
                      testID="dashboard-add-game-account-tab"
                      position="relative"
                      width={58}
                      height={58}
                      items="center"
                      justify="center"
                      rounded="$12"
                      bg="$appSurfaceStrong"
                      borderWidth={2}
                      borderColor={canCreateGame ? '$appAccent' : '$appMutedRing'}
                      disabled={!canCreateGame}
                      transition={reducedMotion ? '0ms' : 'quickLessBouncy'}
                      hoverStyle={{ bg: '$appAccentSoft' }}
                      pressStyle={{ opacity: 0.82, scale: 0.93 }}
                      focusVisibleStyle={{
                        outlineColor: canCreateGame ? '$appAccent' : '$appMuted',
                        outlineStyle: 'solid',
                        outlineWidth: 2,
                      }}
                      onPress={onAddGameAccount}
                      role="button"
                      aria-label={t('account.add')}
                    >
                      <YStack
                        position="absolute"
                        t={5}
                        b={5}
                        l={5}
                        r={5}
                        rounded="$12"
                        borderWidth={1}
                        borderColor={canCreateGame ? '$appAccentBorder' : '$appBorder'}
                        opacity={canCreateGame ? 0.72 : 0.5}
                        style={{ pointerEvents: 'none' }}
                      />
                      <Plus
                        size={29}
                        color={canCreateGame ? colors.appAccent.val : colors.appMuted.val}
                        strokeWidth={canCreateGame ? 2.25 : 1.75}
                      />
                    </Button>
                  </YStack>
                </YStack>
              ) : null}
              <Button
                testID={`dashboard-tab-${page.id}`}
                unstyled
                grow={1}
                flexBasis={0}
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
            </Fragment>
          );
        })}
      </XStack>
    </YStack>
  );
}
