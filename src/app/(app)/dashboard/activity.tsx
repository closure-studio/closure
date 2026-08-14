import { ActivityTimelineView, DashboardPageScroll, useActiveLogs } from '@/features/dashboard';

export default function DashboardActivityRoute() {
  const logs = useActiveLogs();
  return <DashboardPageScroll><ActivityTimelineView entries={logs.logs} /></DashboardPageScroll>;
}