import { ChevronLeft, LogOut, Orbit } from 'lucide-react-native';
import type { PropsWithChildren, RefObject } from 'react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter } from 'expo-router';
import type { View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { AnimatePresence, Button, XStack, YStack, getTokens } from 'tamagui';

import {
  DecorativeBarcode,
  MonoText,
  TerminalMarquee,
  TerminalText,
} from '@/components';
import { MobileBottomNavigation } from '../components/mobile-bottom-navigation';
import { NavigationHeader } from '../components/navigation-header';
import {
  dashboardSections,
  getMatrixReturnAction,
  getNavigationMode,
  navigationPages,
  shouldShowMobileBottomNavigation,
} from '../navigation-config';
import type { NavigationPageId, NavigationPageRoute } from '../navigation-config';
import { useNavigationState } from '../navigation-context';

const navigationMarqueeMessages = [
  { id: 'network', translationKey: 'marquee.network', tone: 'accent' },
  { id: 'matrix', translationKey: 'marquee.matrix', tone: 'default' },
  { id: 'recording', translationKey: 'marquee.recording', tone: 'warning' },
  { id: 'sync', translationKey: 'marquee.sync', tone: 'success' },
] as const;

type NavigationLayoutProps = PropsWithChildren<{
  blurTarget: RefObject<View | null>;
  onLogout: () => void;
  onMatrixMode: () => void;
}>;

export function NavigationLayout({ blurTarget, children, onLogout, onMatrixMode }: NavigationLayoutProps) {
  const { t } = useTranslation('navigation');
  const { t: tCommon } = useTranslation('common');
  const { t: tDashboard } = useTranslation('dashboard');
  const colors = getTokens().color;
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const enteredFromDashboard = useRef(false);
  const { activeDashboardSectionId, selectDashboardSection } = useNavigationState();
  const mode = getNavigationMode(pathname);
  const activePage = navigationPages.find((page) => page.route === pathname) ?? navigationPages[0];
  const activePageId = activePage.id;
  const showMobileBottomNavigation = shouldShowMobileBottomNavigation(activePageId);
  const headerTitle = mode === 'dashboard'
    ? activeDashboardSectionId === 'overview'
      ? t('pages.dashboard.label')
      : tDashboard(`navigation.sections.${activeDashboardSectionId}.label`)
    : t(`pages.${activePageId}.label`);

  useEffect(() => {
    if (mode === 'matrix') onMatrixMode();
  }, [mode, onMatrixMode]);

  const returnToDashboard = () => {
    const action = getMatrixReturnAction(enteredFromDashboard.current, router.canGoBack());
    enteredFromDashboard.current = false;
    if (action.kind === 'back') {
      router.back();
      return;
    }
    router.replace(action.route);
  };

  const handleMatrixPress = () => {
    if (mode === 'dashboard') {
      enteredFromDashboard.current = true;
      router.push('/settings');
      return;
    }
    returnToDashboard();
  };

  const handleSettingsPress = () => {
    if (activePageId === 'site') {
      returnToDashboard();
      return;
    }
    if (mode === 'dashboard') {
      enteredFromDashboard.current = true;
      router.push('/settings');
      return;
    }
    router.replace('/settings');
  };

  const handleSelectPage = (pageId: NavigationPageId, route: NavigationPageRoute) => {
    if (pageId === activePageId) return;
    if (pageId === 'dashboard') {
      returnToDashboard();
      return;
    }
    router.replace(route);
  };

  const handleSelectDashboardSection = (sectionId: string) => {
    const section = dashboardSections.find((candidate) => candidate.id === sectionId);
    if (section) selectDashboardSection(section.id);
  };

  const handleSelectNavigationPage = (pageId: string) => {
    const page = navigationPages.find((candidate) => candidate.id === pageId);
    if (page) handleSelectPage(page.id, page.route);
  };

  const transition = reducedMotion ? '0ms' : '400ms';
  const enterStyle = reducedMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 22, filter: 'blur(8px)' };
  const exitStyle = reducedMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: -18, filter: 'blur(8px)' };

  return (
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
                key={mode}
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
                {mode === 'dashboard'
                  ? dashboardSections.map((section) => {
                    const isActive = section.id === activeDashboardSectionId;
                    const Icon = section.icon;
                    return (
                      <Button
                        key={section.id}
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
                        onPress={() => selectDashboardSection(section.id)}
                        aria-pressed={isActive}
                        $platform-web={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                      >
                        <Icon size={18} color={isActive ? colors.terminalCyan.val : colors.terminalMuted.val} strokeWidth={isActive ? 2 : 1.5} />
                        <TerminalText size="$3" fontWeight={isActive ? '700' : '500'} color={isActive ? '$terminalCyan' : '$terminalMuted'} numberOfLines={1}>{tDashboard(`navigation.sections.${section.id}.label`)}</TerminalText>
                      </Button>
                    );
                  })
                  : navigationPages.map((page) => {
                    const isActive = page.id === activePageId;
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
                        onPress={() => handleSelectPage(page.id, page.route)}
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
              borderColor={mode === 'matrix' ? '$terminalCyanBorder' : '$terminalBorder'}
              bg={mode === 'matrix' ? '$terminalCyanSoft' : '$terminalRaisedTranslucent'}
              hoverStyle={{ borderColor: '$terminalCyanBorder', bg: '$terminalCyanSoft' }}
              pressStyle={{ opacity: 0.7 }}
              onPress={handleMatrixPress}
              aria-label={mode === 'dashboard' ? t('matrix.open') : t('matrix.returnToDashboard')}
              $platform-web={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
            >
              <XStack items="center" gap="$2.5">
                {mode === 'matrix' ? <ChevronLeft size={16} color={colors.terminalCyan.val} /> : <Orbit size={17} color={colors.terminalCyan.val} />}
                <TerminalText size="$2.5" color="$terminalCyan" fontWeight="700">
                  {t(mode === 'dashboard' ? 'matrix.label' : 'matrix.return')}
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
              isSettingsActive={activePageId === 'site'}
              onSettingsPress={handleSettingsPress}
              settingsLabel={t(activePageId === 'site' ? 'matrix.close' : 'matrix.open')}
              title={headerTitle}
            />
            <TerminalMarquee items={navigationMarqueeMessages.map((message) => ({ id: message.id, label: t(message.translationKey), tone: message.tone }))} />
          </YStack>

          <YStack grow={1} shrink={1} minW={0} minH={0} overflow="hidden">
            {children}
          </YStack>

          {showMobileBottomNavigation && (
            mode === 'dashboard' ? (
              <MobileBottomNavigation
                activeId={activeDashboardSectionId}
                items={dashboardSections.map((section) => ({
                  icon: section.icon,
                  id: section.id,
                  label: tDashboard(`navigation.sections.${section.id}.label`),
                }))}
                navigationKey={mode}
                onSelect={handleSelectDashboardSection}
                reducedMotion={reducedMotion}
              />
            ) : (
              <MobileBottomNavigation
                activeId={activePageId}
                items={navigationPages.map((page) => ({
                  icon: page.icon,
                  id: page.id,
                  label: t(`pages.${page.id}.label`),
                }))}
                navigationKey={mode}
                onSelect={handleSelectNavigationPage}
                reducedMotion={reducedMotion}
              />
            )
          )}
        </YStack>
      </XStack>
    </YStack>
  );
}
