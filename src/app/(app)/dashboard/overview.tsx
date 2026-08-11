import {
  DashboardPageScroll,
  GameAccountOverviewView,
} from '@/features/dashboard';
import { selectActiveGameAccount, useAppStore } from '@/store';

export default function DashboardOverviewRoute() {
  const activeGameAccount = useAppStore(selectActiveGameAccount);

  return (
    <DashboardPageScroll>
      <GameAccountOverviewView gameAccount={activeGameAccount} />
    </DashboardPageScroll>
  );
}
