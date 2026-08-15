import {
  DashboardPageFrame,
  GameAccountOverviewView,
  getStageDisplayLabel,
  useSelectedGameAccount,
  useSelectedGameDetail,
  useStageTable,
} from '@/features/dashboard';

export default function DashboardOverviewRoute() {
  const selectedGameAccount = useSelectedGameAccount();
  const detail = useSelectedGameDetail();
  const stageTable = useStageTable();

  if (!selectedGameAccount) return null;
  const stageLabel = getStageDisplayLabel(stageTable, selectedGameAccount.config.map_id, '—');

  return (
    <DashboardPageFrame scroll>
      <GameAccountOverviewView detail={detail} gameAccount={selectedGameAccount} stageLabel={stageLabel} />
    </DashboardPageFrame>
  );
}