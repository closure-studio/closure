import { useEffect } from 'react';

import { ActivityTimelineView, DashboardPageScroll } from '@/features/dashboard';
import { selectActiveGameAccount, selectActiveLogs, useAppStore } from '@/store';

export default function DashboardActivityRoute() {
  const account = useAppStore(selectActiveGameAccount);
  const logs = useAppStore(selectActiveLogs);
  const loadGameLogs = useAppStore((state) => state.loadGameLogs);
  useEffect(() => {
    if (account) {
      loadGameLogs(account.account).catch((error: unknown) => {
        console.error('Unable to load ArkHost Game Logs.', error);
      });
    }
  }, [account, loadGameLogs]);
  return <DashboardPageScroll><ActivityTimelineView entries={logs.logs} /></DashboardPageScroll>;
}
