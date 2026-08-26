import {
  ActivityTimelineView,
  DashboardPageFrame,
} from '@/features/dashboard';
import { mockDashboardSchedule } from '@/mocks/dashboard';

export default function DashboardActivityRoute() {
  return <DashboardPageFrame scroll><ActivityTimelineView entries={mockDashboardSchedule} /></DashboardPageFrame>;
}
