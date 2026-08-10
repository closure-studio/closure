import {
  DashboardPageScroll,
  OperatorRosterView,
  useDashboardState,
} from '@/features/dashboard';

export default function DashboardOperatorsRoute() {
  const { activeGameAccount } = useDashboardState();

  return (
    <DashboardPageScroll>
      <OperatorRosterView operators={activeGameAccount.operators} />
    </DashboardPageScroll>
  );
}
