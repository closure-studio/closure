import {
  DashboardPageScroll,
  GameAccountOverviewView,
  getStageDisplayLabel,
} from '@/features/dashboard';
import {
  selectActiveGameAccount,
  selectActiveGameDetail,
  selectStageTable,
  useAppStore,
} from '@/store';

export default function DashboardOverviewRoute() {
  const activeGameAccount = useAppStore(selectActiveGameAccount);
  const detail = useAppStore(selectActiveGameDetail);
  const stageTable = useAppStore(selectStageTable);

  if (!activeGameAccount) return null;
  const stageLabel = getStageDisplayLabel(stageTable, activeGameAccount.config.map_id, '—');

  return (
    <DashboardPageScroll>
      <GameAccountOverviewView detail={detail} gameAccount={activeGameAccount} stageLabel={stageLabel} />
    </DashboardPageScroll>
  );
}
