import {
  ActivityTimelineView,
  DashboardPageScroll,
  useDashboardState,
} from '@/features/dashboard';

export default function DashboardActivityRoute() {
  const { activeGameAccount } = useDashboardState();

  return (
    <DashboardPageScroll>
      <ActivityTimelineView entries={activeGameAccount.activityTimeline} />
    </DashboardPageScroll>
  );
}
