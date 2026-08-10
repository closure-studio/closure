import {
  DashboardPageScroll,
  GameAccountOverviewView,
  useDashboardState,
} from '@/features/dashboard';

export default function DashboardOverviewRoute() {
  const { activeGameAccount } = useDashboardState();

  return (
    <DashboardPageScroll>
      <GameAccountOverviewView gameAccount={activeGameAccount} />
    </DashboardPageScroll>
  );
}
