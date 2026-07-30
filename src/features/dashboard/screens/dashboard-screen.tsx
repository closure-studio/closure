import { LogOut, Settings, Wifi } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import type { LayoutChangeEvent, ScrollView as NativeScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedRef, useScrollOffset, useSharedValue } from 'react-native-reanimated';
import { AnimatePresence, Button, XStack, YStack, getTokens } from 'tamagui';

import { FlickeringStatusIndicator, MonoText, TerminalMarquee } from '@/components';
import { ActivityTimelineView } from '../components/activity-timeline-view';
import { DesktopSidebar, GameAccountSwitcher } from '../components/dashboard-navigation';
import { GameAccountOverviewView } from '../components/game-account-overview-view';
import { LinkGameAccountSheet } from '../components/link-game-account-sheet';
import { MaterialInventoryView } from '../components/material-inventory-view';
import { OperatorRosterView } from '../components/operator-roster-view';
import { RoutineTasksView } from '../components/routine-tasks-view';
import { useDashboardController } from '../hooks/use-dashboard-controller';
import { dashboardSections } from '../navigation';
import { selectBackdropTint } from '../selectors';

const dashboardMarqueeMessages = [
  { id: 'contract', translationKey: 'marquee.contract', tone: 'warning' },
  { id: 'recruitment', translationKey: 'marquee.recruitment', tone: 'default' },
  { id: 'network', translationKey: 'marquee.network', tone: 'accent' },
  { id: 'maintenance', translationKey: 'marquee.maintenance', tone: 'default' },
] as const;

export function DashboardScreen({
  onLogout,
  onBackdropTintChange,
  onOpenSettings,
}: {
  onLogout: () => void;
  onBackdropTintChange: (tint: string) => void;
  onOpenSettings: () => void;
}) {
  const { t } = useTranslation('common');
  const { t: tDashboard } = useTranslation('dashboard');
  const { t: tSettings } = useTranslation('settings');
  const colors = getTokens().color;
  const {
    activeGameAccount,
    activeGameAccountId,
    activeSectionId,
    gameAccounts,
    isLinkGameAccountSheetOpen,
    linkGameAccount,
    selectGameAccount,
    selectSection,
    setIsLinkGameAccountSheetOpen,
    toggleRoutineTaskCompletion,
  } = useDashboardController();
  const [mobileNavigationWidth, setMobileNavigationWidth] = useState(0);
  const contentScrollRef = useAnimatedRef<NativeScrollView>();
  const viewportOffset = useScrollOffset(contentScrollRef);
  const viewportHeight = useSharedValue(0);
  const scrollViewport = useMemo(
    () => ({ height: viewportHeight, offset: viewportOffset, ref: contentScrollRef }),
    [contentScrollRef, viewportHeight, viewportOffset],
  );
  const activeSectionIndex = dashboardSections.findIndex((section) => section.id === activeSectionId);
  const mobileNavigationButtonWidth = Math.max(0, (mobileNavigationWidth - 16) / dashboardSections.length);
  const mobileNavigationIndicatorWidth = Math.max(0, mobileNavigationButtonWidth - 16);
  const mobileNavigationIndicatorLeft = 16 + activeSectionIndex * mobileNavigationButtonWidth;
  const backdropTint = selectBackdropTint(activeGameAccount, {
    primary: colors.terminalCyan.val,
    warning: colors.terminalWarning.val,
    muted: colors.terminalMuted.val,
  });

  useEffect(() => {
    onBackdropTintChange(backdropTint);
  }, [backdropTint, onBackdropTintChange]);

  const handleContentLayout = (event: LayoutChangeEvent) => {
    viewportHeight.set(event.nativeEvent.layout.height);
  };

  return (
    <YStack grow={1} height="100%" maxH="100%" overflow="hidden">
      <XStack grow={1} shrink={1} minH={0}>
        <DesktopSidebar activeSectionId={activeSectionId} onSelectSection={selectSection} onLogout={onLogout} onOpenSettings={onOpenSettings} />

        <YStack grow={1} shrink={1} minW={0} minH={0}>
          <YStack borderBottomWidth={1} borderColor="$terminalBorder" bg="$terminalSurface">
            <XStack px="$3.5" pt="$3" pb="$2" items="center" justify="flex-end" $md={{ display: 'none' }}>
              <XStack items="center" gap="$2"><Wifi size={13} color={colors.terminalMuted.val} /><MonoText size="$1">{tDashboard('navigation.secureLink')}</MonoText><FlickeringStatusIndicator color={colors.terminalSuccess.val} /><Button unstyled width="$3" height="$3" items="center" justify="center" borderWidth={1} borderColor="$terminalBorder" hoverStyle={{ borderColor: '$terminalCyanBorder', bg: '$terminalCyanSoft' }} pressStyle={{ opacity: 0.7 }} aria-label={tSettings('openSettings')} onPress={onOpenSettings}><Settings size={13} color={colors.terminalMuted.val} /></Button><Button unstyled px="$2" py="$1" borderWidth={1} borderColor="$terminalBorder" hoverStyle={{ borderColor: '$terminalWarningBorder' }} pressStyle={{ opacity: 0.7 }} onPress={onLogout}><XStack items="center" gap="$1"><LogOut size={12} color={colors.terminalMuted.val} /><MonoText size="$1">{t('actions.logout')}</MonoText></XStack></Button></XStack>
            </XStack>
            <TerminalMarquee items={dashboardMarqueeMessages.map((message) => ({ id: message.id, label: tDashboard(message.translationKey), tone: message.tone }))} />
            <YStack px="$3.5" py="$3" $md={{ px: '$5' }}><GameAccountSwitcher gameAccounts={gameAccounts} activeGameAccountId={activeGameAccountId} onSelectGameAccount={selectGameAccount} onLinkGameAccount={() => setIsLinkGameAccountSheetOpen(true)} /></YStack>
          </YStack>

          <YStack grow={1} shrink={1} minW={0} minH={0} position="relative">
            <AnimatePresence mode="wait">
              <YStack
                key={`${activeGameAccountId}-${activeSectionId}`}
                transition="400ms"
                position="absolute"
                t={0}
                b={0}
                l={0}
                r={0}
                opacity={1}
                y={0}
                filter="blur(0px)"
                enterStyle={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                exitStyle={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
              >
                <Animated.ScrollView
                  ref={contentScrollRef}
                  style={{ flexGrow: 1, flexShrink: 1, minHeight: 0 }}
                  contentInsetAdjustmentBehavior="automatic"
                  showsVerticalScrollIndicator={false}
                  onLayout={handleContentLayout}
                  contentContainerStyle={{ flexGrow: 1 }}
                >
                  <YStack width="100%" maxW={1152} self="center" p="$3.5" pt="$4" $md={{ p: '$5' }}>
                    {activeSectionId === 'overview' ? <GameAccountOverviewView gameAccount={activeGameAccount} viewport={scrollViewport} /> : null}
                    {activeSectionId === 'operatorRoster' ? <OperatorRosterView operators={activeGameAccount.operators} /> : null}
                    {activeSectionId === 'materialInventory' ? <MaterialInventoryView materials={activeGameAccount.materials} /> : null}
                    {activeSectionId === 'routineTasks' ? <RoutineTasksView tasks={activeGameAccount.routineTasks} onToggle={toggleRoutineTaskCompletion} /> : null}
                    {activeSectionId === 'activityTimeline' ? <ActivityTimelineView entries={activeGameAccount.activityTimeline} viewport={scrollViewport} /> : null}
                  </YStack>
                </Animated.ScrollView>
              </YStack>
            </AnimatePresence>
          </YStack>

          <XStack position="relative" px="$2" py={6} borderTopWidth={1} borderColor="$terminalBorder" bg="$terminalBg" onLayout={(event: LayoutChangeEvent) => setMobileNavigationWidth(event.nativeEvent.layout.width)} $md={{ display: 'none' }}>
            <YStack transition="quickLessBouncy" position="absolute" t={6} l={mobileNavigationIndicatorLeft} width={mobileNavigationIndicatorWidth} height={2} bg="$terminalCyan" opacity={mobileNavigationWidth > 0 ? 1 : 0} />
            {dashboardSections.map((section) => {
              const isActive = section.id === activeSectionId;
              const Icon = section.icon;
              return (
                <Button key={section.id} unstyled grow={1} py="$2" items="center" gap="$1" hoverStyle={{ bg: '$terminalCyanSoft' }} pressStyle={{ opacity: 0.7 }} onPress={() => selectSection(section.id)} aria-pressed={isActive}>
                  <Icon size={19} color={isActive ? colors.terminalCyan.val : colors.terminalMuted.val} strokeWidth={isActive ? 2 : 1.5} />
                  <MonoText size="$1" color={isActive ? '$terminalCyan' : '$terminalMuted'}>{tDashboard(`navigation.sections.${section.id}.label`)}</MonoText>
                </Button>
              );
            })}
          </XStack>
        </YStack>
      </XStack>
      <LinkGameAccountSheet open={isLinkGameAccountSheetOpen} onOpenChange={setIsLinkGameAccountSheetOpen} onSubmit={linkGameAccount} />
    </YStack>
  );
}
