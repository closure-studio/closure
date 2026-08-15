import { ActivityTimelineView, DashboardPageFrame, useSelectedLogs } from '@/features/dashboard';

export default function DashboardActivityRoute() {
  const logs = useSelectedLogs();
  return <DashboardPageFrame scroll><ActivityTimelineView entries={logs.logs} /></DashboardPageFrame>;
}