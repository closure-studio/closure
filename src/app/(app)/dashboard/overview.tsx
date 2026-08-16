import {
  DashboardPageFrame,
  GameAccountOverviewView,
  getStageDisplayLabel,
  useSelectedGameAccount,
  useSelectedGameDetailQuery,
  useStageTable,
} from '@/features/dashboard';

export default function DashboardOverviewRoute() {
  const selectedGameAccount = useSelectedGameAccount();
  const detailQuery = useSelectedGameDetailQuery();
  const stageTable = useStageTable();

  if (!selectedGameAccount) return null;
  const stageLabel = getStageDisplayLabel(stageTable, selectedGameAccount.config.map_id, '—');

  return (
    <DashboardPageFrame scroll>
      <GameAccountOverviewView detail={detailQuery.data ?? null} gameAccount={selectedGameAccount} stageLabel={stageLabel} />
    </DashboardPageFrame>
  );
}
