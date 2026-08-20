import {
  DashboardPageFrame,
  GameLogsView,
  GameAccountOverviewView,
  getStageDisplayLabel,
  useSelectedGameAccount,
  useSelectedGameDetailQuery,
  useSelectedGameLogsQuery,
  useStageTable,
} from '@/features/dashboard';

export default function DashboardOverviewRoute() {
  const selectedGameAccount = useSelectedGameAccount();
  const detailQuery = useSelectedGameDetailQuery();
  const logsQuery = useSelectedGameLogsQuery();
  const stageTable = useStageTable();

  if (!selectedGameAccount) return null;
  const stageLabel = getStageDisplayLabel(stageTable, selectedGameAccount.config.map_id, '—');

  return (
    <DashboardPageFrame scroll>
      <GameAccountOverviewView detail={detailQuery.data ?? null} gameAccount={selectedGameAccount} stageLabel={stageLabel} />
      <GameLogsView entries={logsQuery.data?.logs ?? []} />
    </DashboardPageFrame>
  );
}
