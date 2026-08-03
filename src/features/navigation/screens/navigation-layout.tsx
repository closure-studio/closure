import { ChevronLeft, LogOut, Orbit } from 'lucide-react-native';
import type { PropsWithChildren, RefObject } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter } from 'expo-router';
import type { View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { AnimatePresence, Button, XStack, YStack, getTokens, useMedia } from 'tamagui';

import {
  DecorativeBarcode,
  HorizontalSwipeScope,
  MonoText,
  SettingsTransitionProvider,
  TerminalMarquee,
  TerminalText,
} from '@/components';
import type { HorizontalSwipeDirection, SettingsTransitionDirection } from '@/components';
import { MobileBottomNavigation } from '../components/mobile-bottom-navigation';
import { NavigationHeader } from '../components/navigation-header';
import {
  SettingsSwipePager,
  resolveSettingsSwipeAction,
} from '../components/settings-swipe-pager';
import {
  dashboardNavigation,
  getNavigationScope,
  settingsNavigation,
} from '../navigation-config';
import type { SettingsPageId } from '../navigation-config';

const navigationMarqueeMessages = [
  { id: 'network', translationKey: 'marquee.network', tone: 'accent' },
  { id: 'navigation', translationKey: 'marquee.navigation', tone: 'default' },
  { id: 'account', translationKey: 'marquee.account', tone: 'warning' },
  { id: 'sync', translationKey: 'marquee.sync', tone: 'success' },
] as const;

const dashboardPages = Object.values(dashboardNavigation.pages).sort((left, right) => left.sort - right.sort);
const settingsPages = Object.values(settingsNavigation.pages).sort((left, right) => left.sort - right.sort);

type NavigationLayoutProps = PropsWithChildren<{
  blurTarget: RefObject<View | null>;
  onEnterSettings: () => void;
  onLogout: () => void;
}>;

export function NavigationLayout({ blurTarget, children, onEnterSettings, onLogout }: NavigationLayoutProps) {
  const { t } = useTranslation('navigation');
  const { t: tCommon } = useTranslation('common');
  const { t: tDashboard } = useTranslation('dashboard');
  const colors = getTokens().color;
  const media = useMedia();
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [settingsTransitionDirection, setSettingsTransitionDirection] = useState<SettingsTransitionDirection>('none');
  const scope = getNavigationScope(pathname);
  const activeDashboardPage = dashboardPages.find((page) => page.route === pathname) ?? dashboardNavigation.defaultPage;
  const activeSettingsPage = settingsPages.find((page) => page.route === pathname) ?? settingsNavigation.defaultPage;
  const isSettingsSwipeEnabled = Boolean(media['max-md']);
  const headerTitle = scope === 'dashboard'
    ? tDashboard(`navigation.sections.${activeDashboardPage.id}.label`)
    : t(`pages.${activeSettingsPage.id}.label`);

  useEffect(() => {
    if (scope === 'settings') onEnterSettings();
  }, [onEnterSettings, scope]);

  const handleScopePress = () => {
    setSettingsTransitionDirection('none');
    router.replace(scope === 'dashboard'
      ? settingsNavigation.defaultPage.route
      : dashboardNavigation.defaultPage.route);
  };

  const handleExitSettings = () => {
    setSettingsTransitionDirection('none');
    router.replace(dashboardNavigation.defaultPage.route);
  };

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
    if (page && page.route !== pathname) router.replace(page.route);
  };

  const handleSelectSettingsPage = (pageId: SettingsPageId) => {
    const page = settingsPages.find((candidate) => candidate.id === pageId);
    if (!page || page.route === pathname) return;

    const currentIndex = settingsPages.findIndex((candidate) => candidate.id === activeSettingsPage.id);
    const nextIndex = settingsPages.findIndex((candidate) => candidate.id === pageId);
    setSettingsTransitionDirection(nextIndex > currentIndex ? 'forward' : 'backward');
    router.replace(page.route);
  };

  const transition = reducedMotion ? '0ms' : '400ms';
  const enterStyle = reducedMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 22, filter: 'blur(8px)' };
  const exitStyle = reducedMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: -18, filter: 'blur(8px)' };

  return (
    <SettingsTransitionProvider direction={settingsTransitionDirection} reducedMotion={reducedMotion}>
      <HorizontalSwipeScope
        active={scope === 'settings'}
        enabled={isSettingsSwipeEnabled}
        name="settings-navigation"
        onSwipe={handleSettingsSwipe}
      />
        <YStack grow={1} height="100%" maxH="100%" overflow="hidden">
      <XStack grow={1} shrink={1} minH={0}>
        <YStack
          display="none"
          width={224}
          shrink={0}
          borderRightWidth={1}
          borderColor="$terminalBorder"
          bg="$terminalSurface"
          $md={{ display: 'flex' }}
          $xl={{ width: 256 }}
        >
          <YStack px="$4.5" py="$4.5" gap="$2" borderBottomWidth={1} borderColor="$terminalBorder">
            <TerminalText size="$5" fontWeight="800" letterSpacing={2.8}>{tDashboard('navigation.brandTitle')}</TerminalText>
            <MonoText size="$1">{tDashboard('navigation.brandSubtitle')}</MonoText>
            <YStack mt="$1"><DecorativeBarcode /></YStack>
          </YStack>

          <YStack grow={1} minH={0} position="relative" overflow="hidden">
            <AnimatePresence mode="wait">
              <YStack
                key={scope}
                transition={transition}
                position="absolute"
                t={0}
                b={0}
                l={0}
                r={0}
                px="$3"
                py="$4"
                gap="$1.5"
                opacity={1}
                y={0}
                filter="blur(0px)"
                enterStyle={enterStyle}
                exitStyle={exitStyle}
              >
                {scope === 'dashboard'
                  ? dashboardPages.map((page) => {
                    const isActive = page.id === activeDashboardPage.id;
                    const Icon = page.icon;
                    return (
                      <Button
                        key={page.id}
                        unstyled
                        minH="$4.5"
                        px="$3"
                        py="$2"
                        flexDirection="row"
                        items="center"
                        justify="flex-start"
                        gap="$3"
                        borderWidth={1}
                        borderColor={isActive ? '$terminalCyanBorder' : 'transparent'}
                        bg={isActive ? '$terminalCyanSoft' : 'transparent'}
                        hoverStyle={{ borderColor: '$terminalBorder', bg: '$terminalRaised' }}
                        pressStyle={{ opacity: 0.7 }}
                        onPress={() => handleSelectDashboardPage(page.id)}
                        aria-pressed={isActive}
                        $platform-web={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                      >
                        <Icon size={18} color={isActive ? colors.terminalCyan.val : colors.terminalMuted.val} strokeWidth={isActive ? 2 : 1.5} />
                        <TerminalText size="$3" fontWeight={isActive ? '700' : '500'} color={isActive ? '$terminalCyan' : '$terminalMuted'} numberOfLines={1}>{tDashboard(`navigation.sections.${page.id}.label`)}</TerminalText>
                      </Button>
                    );
                  })
                  : settingsPages.map((page) => {
                    const isActive = page.id === activeSettingsPage.id;
                    const Icon = page.icon;
                    return (
                      <Button
                        key={page.id}
                        unstyled
                        minH="$5"
                        px="$3"
                        py="$2"
                        flexDirection="row"
                        items="center"
                        justify="flex-start"
                        gap="$3"
                        borderWidth={1}
                        borderColor={isActive ? '$terminalCyanBorder' : 'transparent'}
                        bg={isActive ? '$terminalCyanSoft' : 'transparent'}
                        hoverStyle={{ borderColor: '$terminalCyanBorder', bg: '$terminalRaised' }}
                        pressStyle={{ opacity: 0.7 }}
                        onPress={() => handleSelectSettingsPage(page.id)}
                        aria-pressed={isActive}
                        $platform-web={{ clipPath: 'polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px))' }}
                      >
                        <Icon size={19} color={isActive ? colors.terminalCyan.val : colors.terminalMuted.val} strokeWidth={isActive ? 2 : 1.5} />
                        <TerminalText size="$3" fontWeight={isActive ? '700' : '500'} color={isActive ? '$terminalCyan' : '$terminalMuted'} numberOfLines={1}>{t(`pages.${page.id}.label`)}</TerminalText>
                      </Button>
                    );
                  })}
              </YStack>
            </AnimatePresence>
          </YStack>

          <YStack px="$3" pb="$3">
            <Button
              unstyled
              minH="$5"
              px="$3"
              flexDirection="row"
              items="center"
              justify="flex-start"
              borderWidth={1}
              borderColor={scope === 'settings' ? '$terminalCyanBorder' : '$terminalBorder'}
              bg={scope === 'settings' ? '$terminalCyanSoft' : '$terminalRaisedTranslucent'}
              hoverStyle={{ borderColor: '$terminalCyanBorder', bg: '$terminalCyanSoft' }}
              pressStyle={{ opacity: 0.7 }}
              onPress={handleScopePress}
              aria-label={scope === 'dashboard' ? t('scopeSwitcher.openSettings') : t('scopeSwitcher.returnToDashboard')}
              $platform-web={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
            >
              <XStack items="center" gap="$2.5">
                {scope === 'settings' ? <ChevronLeft size={16} color={colors.terminalCyan.val} /> : <Orbit size={17} color={colors.terminalCyan.val} />}
                <TerminalText size="$2.5" color="$terminalCyan" fontWeight="700">
                  {t(scope === 'dashboard' ? 'scopeSwitcher.settings' : 'scopeSwitcher.dashboard')}
                </TerminalText>
              </XStack>
            </Button>
          </YStack>

          <YStack px="$4.5" py="$4" borderTopWidth={1} borderColor="$terminalBorder">
            <Button unstyled height="$4" px="$3" flexDirection="row" items="center" justify="center" gap="$2" borderWidth={1} borderColor="$terminalBorder" hoverStyle={{ borderColor: '$terminalWarningBorder', bg: '$terminalWarningSoft' }} pressStyle={{ opacity: 0.7 }} onPress={onLogout}>
              <LogOut size={14} color={colors.terminalMuted.val} />
              <MonoText size="$2">{tCommon('actions.logout')}</MonoText>
            </Button>
          </YStack>
        </YStack>

        <YStack grow={1} shrink={1} minW={0} minH={0}>
          <YStack borderBottomWidth={1} borderColor="$terminalBorder">
            <NavigationHeader
              avatarInitial={t('mobile.avatarInitial')}
              avatarLabel={t('mobile.avatarLabel')}
              blurTarget={blurTarget}
              isSettingsActive={scope === 'settings'}
              onSettingsPress={handleScopePress}
              settingsLabel={t(scope === 'dashboard' ? 'scopeSwitcher.openSettings' : 'scopeSwitcher.returnToDashboard')}
              title={headerTitle}
            />
            <TerminalMarquee items={navigationMarqueeMessages.map((message) => ({ id: message.id, label: t(message.translationKey), tone: message.tone }))} />
          </YStack>

          <YStack grow={1} shrink={1} minW={0} minH={0} overflow="hidden">
            {scope === 'settings' ? (
              <SettingsSwipePager
                activeId={activeSettingsPage.id}
                hint={t('mobile.swipeHint')}
                items={settingsPages.map((page) => ({
                  id: page.id,
                  label: t(`pages.${page.id}.label`),
                }))}
                onSelect={handleSelectSettingsPage}
              >
                {children}
              </SettingsSwipePager>
            ) : children}
          </YStack>

          {scope === 'dashboard' ? (
            <MobileBottomNavigation
              activeId={activeDashboardPage.id}
              items={dashboardPages.map((page) => ({
                icon: page.icon,
                id: page.id,
                label: tDashboard(`navigation.sections.${page.id}.label`),
              }))}
              navigationKey={scope}
              onSelect={handleSelectDashboardPage}
              reducedMotion={reducedMotion}
            />
          ) : null}
        </YStack>
      </XStack>
        </YStack>
    </SettingsTransitionProvider>
  );
}
