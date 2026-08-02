import { useEffect, useMemo } from 'react';
import type { LayoutChangeEvent, ScrollView as NativeScrollView } from 'react-native';
import Animated, { useAnimatedRef, useScrollOffset, useSharedValue } from 'react-native-reanimated';
import { AnimatePresence, YStack, getTokens } from 'tamagui';

import { useNavigationState } from '@/features/navigation';
import { ActivityTimelineView } from '../components/activity-timeline-view';
import { GameAccountSwitcher } from '../components/dashboard-navigation';
import { GameAccountOverviewView } from '../components/game-account-overview-view';
import { LinkGameAccountSheet } from '../components/link-game-account-sheet';
import { MaterialInventoryView } from '../components/material-inventory-view';
import { OperatorRosterView } from '../components/operator-roster-view';
import { RoutineTasksView } from '../components/routine-tasks-view';
import { useDashboardController } from '../hooks/use-dashboard-controller';
import { selectBackdropTint } from '../selectors';

export function DashboardScreen({
  onBackdropTintChange,
}: {
  onBackdropTintChange: (tint: string) => void;
}) {
  const colors = getTokens().color;
  const { activeDashboardSectionId, selectDashboardSection } = useNavigationState();
  const {
    activeGameAccount,
    activeGameAccountId,
    gameAccounts,
    isLinkGameAccountSheetOpen,
    linkGameAccount,
    selectGameAccount,
    setIsLinkGameAccountSheetOpen,
    toggleRoutineTaskCompletion,
  } = useDashboardController();
  const contentScrollRef = useAnimatedRef<NativeScrollView>();
  const viewportOffset = useScrollOffset(contentScrollRef);
  const viewportHeight = useSharedValue(0);
  const scrollViewport = useMemo(
    () => ({ height: viewportHeight, offset: viewportOffset, ref: contentScrollRef }),
    [contentScrollRef, viewportHeight, viewportOffset],
  );
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
      <YStack borderBottomWidth={1} borderColor="$terminalBorder" bg="$terminalSurface">
        <YStack px="$3.5" py="$3" $md={{ px: '$5' }}><GameAccountSwitcher gameAccounts={gameAccounts} activeGameAccountId={activeGameAccountId} onSelectGameAccount={selectGameAccount} onLinkGameAccount={() => setIsLinkGameAccountSheetOpen(true)} /></YStack>
      </YStack>

      <YStack grow={1} shrink={1} minW={0} minH={0} position="relative">
        <AnimatePresence mode="wait">
          <YStack
            key={`${activeGameAccountId}-${activeDashboardSectionId}`}
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
                {activeDashboardSectionId === 'overview' ? <GameAccountOverviewView gameAccount={activeGameAccount} viewport={scrollViewport} /> : null}
                {activeDashboardSectionId === 'operatorRoster' ? <OperatorRosterView operators={activeGameAccount.operators} /> : null}
                {activeDashboardSectionId === 'materialInventory' ? <MaterialInventoryView materials={activeGameAccount.materials} /> : null}
                {activeDashboardSectionId === 'routineTasks' ? <RoutineTasksView tasks={activeGameAccount.routineTasks} onToggle={toggleRoutineTaskCompletion} /> : null}
                {activeDashboardSectionId === 'activityTimeline' ? <ActivityTimelineView entries={activeGameAccount.activityTimeline} viewport={scrollViewport} /> : null}
              </YStack>
            </Animated.ScrollView>
          </YStack>
        </AnimatePresence>
      </YStack>

      <LinkGameAccountSheet
        open={isLinkGameAccountSheetOpen}
        onOpenChange={setIsLinkGameAccountSheetOpen}
        onSubmit={(credentials) => {
          linkGameAccount(credentials);
          selectDashboardSection('overview');
        }}
      />
    </YStack>
  );
}
