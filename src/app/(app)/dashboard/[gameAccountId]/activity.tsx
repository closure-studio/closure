import {
  ActivityTimelineView,
  DashboardPageFrame,
} from '@/features/dashboard';
import { DashboardAccountPager } from '@/features/navigation';
import { mockDashboardSchedule } from '@/mocks/dashboard';

export default function DashboardActivityRoute() {
  return (
    <DashboardAccountPager
      pageId="activity"
      renderAccount={() => (
        <DashboardPageFrame scroll>
          <ActivityTimelineView entries={mockDashboardSchedule} />
        </DashboardPageFrame>
      )}
    />
  );
}
