import {
  DashboardPageFrame,
  GameAccountOverviewView,
  getStageDisplayParts,
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
  const stageDisplay = getStageDisplayParts(stageTable, selectedGameAccount.config.map_id, '—');

  return (
    <DashboardPageFrame scroll>
      <GameAccountOverviewView
        detail={detailQuery.data ?? null}
        gameAccount={selectedGameAccount}
        logs={logsQuery.data?.logs ?? []}
        stageSubtitle={stageDisplay.subtitle}
        stageTitle={stageDisplay.title}
      />
    </DashboardPageFrame>
  );
}
