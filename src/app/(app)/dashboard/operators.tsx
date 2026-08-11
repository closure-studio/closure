import {
  DashboardPageScroll,
  OperatorRosterView,
} from '@/features/dashboard';
import { selectActiveGameAccount, useAppStore } from '@/store';

export default function DashboardOperatorsRoute() {
  const activeGameAccount = useAppStore(selectActiveGameAccount);

  return (
    <DashboardPageScroll>
      <OperatorRosterView operators={activeGameAccount.operators} />
    </DashboardPageScroll>
  );
}
