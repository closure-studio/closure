import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { ScrollView, YStack, getTokens } from 'tamagui';

import type { DashboardPageId } from '@/features/navigation';
import { ActivityTimelineView } from '../components/activity-timeline-view';
import { GameAccountOverviewView } from '../components/game-account-overview-view';
import { InventoryView } from '../components/inventory-view';
import { OperatorRosterView } from '../components/operator-roster-view';
import { RoutineTasksView } from '../components/routine-tasks-view';
import { useDashboardState } from '../dashboard-context';
import { itemTable } from '../item-table';
import { selectBackdropTint } from '../selectors';

type DashboardPageScrollProps = PropsWithChildren<{
  contentMaxWidth: number;
  padded?: boolean;
}>;

function DashboardPageScroll({
  children,
  contentMaxWidth,
  padded = false,
}: DashboardPageScrollProps) {
  return (
    <YStack grow={1} shrink={1} minW={0} minH={0}>
      <ScrollView
        grow={1}
        shrink={1}
        minH={0}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ grow: 1 }}
      >
        <YStack
          width="100%"
          maxW={contentMaxWidth}
          self="center"
          p={padded ? '$3.5' : 0}
          pt={padded ? '$3' : 0}
          $md={padded ? { p: '$5', pt: '$4' } : {}}
        >
          {children}
        </YStack>
      </ScrollView>
    </YStack>
  );
}

export function DashboardScreen({
  activePageId,
  onBackdropTintChange,
}: {
  activePageId: DashboardPageId;
  onBackdropTintChange: (tint: string) => void;
}) {
  const colors = getTokens().color;
  const {
    activeGameAccount,
    toggleRoutineTaskCompletion,
  } = useDashboardState();
  const backdropTint = selectBackdropTint(activeGameAccount, {
    primary: colors.appAccent.val,
    warning: colors.appWarning.val,
    muted: colors.appMuted.val,
  });

  useEffect(() => {
    onBackdropTintChange(backdropTint);
  }, [backdropTint, onBackdropTintChange]);

  return (
    <YStack grow={1} height="100%" maxH="100%" overflow="hidden">
      {activePageId === 'inventory' ? (
        <DashboardPageScroll contentMaxWidth={1440}>
          <InventoryView inventory={activeGameAccount.inventory} itemTable={itemTable} />
        </DashboardPageScroll>
      ) : (
        <DashboardPageScroll contentMaxWidth={1152} padded>
          {activePageId === 'overview' ? <GameAccountOverviewView gameAccount={activeGameAccount} /> : null}
          {activePageId === 'operators' ? <OperatorRosterView operators={activeGameAccount.operators} /> : null}
          {activePageId === 'tasks' ? <RoutineTasksView tasks={activeGameAccount.routineTasks} onToggle={toggleRoutineTaskCompletion} /> : null}
          {activePageId === 'activity' ? <ActivityTimelineView entries={activeGameAccount.activityTimeline} /> : null}
        </DashboardPageScroll>
      )}

    </YStack>
  );
}
