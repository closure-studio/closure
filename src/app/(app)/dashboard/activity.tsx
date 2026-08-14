import { ActivityTimelineView, DashboardPageScroll, useSelectedLogs } from '@/features/dashboard';

export default function DashboardActivityRoute() {
  const logs = useSelectedLogs();
  return <DashboardPageScroll><ActivityTimelineView entries={logs.logs} /></DashboardPageScroll>;
}