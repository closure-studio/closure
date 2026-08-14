import {
  DashboardPageScroll,
  GameAccountOverviewView,
  getStageDisplayLabel,
  useActiveGameAccount,
  useActiveGameDetail,
  useStageTable,
} from '@/features/dashboard';

export default function DashboardOverviewRoute() {
  const activeGameAccount = useActiveGameAccount();
  const detail = useActiveGameDetail();
  const stageTable = useStageTable();

  if (!activeGameAccount) return null;
  const stageLabel = getStageDisplayLabel(stageTable, activeGameAccount.config.map_id, '—');

  return (
    <DashboardPageScroll>
      <GameAccountOverviewView detail={detail} gameAccount={activeGameAccount} stageLabel={stageLabel} />
    </DashboardPageScroll>
  );
}