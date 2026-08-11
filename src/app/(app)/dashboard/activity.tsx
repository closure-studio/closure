import {
  ActivityTimelineView,
  DashboardPageScroll,
} from '@/features/dashboard';
import { selectActiveGameAccount, useAppStore } from '@/store';

export default function DashboardActivityRoute() {
  const activeGameAccount = useAppStore(selectActiveGameAccount);

  return (
    <DashboardPageScroll>
      <ActivityTimelineView entries={activeGameAccount.activityTimeline} />
    </DashboardPageScroll>
  );
}
