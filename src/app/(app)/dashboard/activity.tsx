import {
  ActivityTimelineView,
  DashboardPageFrame,
  useSelectedGameLogsQuery,
} from '@/features/dashboard';

export default function DashboardActivityRoute() {
  const logs = useSelectedGameLogsQuery().data;
  return <DashboardPageFrame scroll><ActivityTimelineView entries={logs?.logs ?? []} /></DashboardPageFrame>;
}
