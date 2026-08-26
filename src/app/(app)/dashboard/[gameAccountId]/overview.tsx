import {
  DashboardPageFrame,
  GameAccountOverviewView,
  getStageDisplayParts,
  useDashboardRoute,
  useGameDetailQuery,
  useGameLogsQuery,
  useStageTable,
} from '@/features/dashboard';

export default function DashboardOverviewRoute() {
  const { gameAccount, gameAccountId } = useDashboardRoute();
  const detailQuery = useGameDetailQuery(gameAccountId);
  const logsQuery = useGameLogsQuery(gameAccountId);
  const stageTable = useStageTable();

  if (!gameAccount) return null;
  const stageDisplay = getStageDisplayParts(stageTable, gameAccount.config.map_id, '—');

  return (
    <DashboardPageFrame scroll>
      <GameAccountOverviewView
        detail={detailQuery.data ?? null}
        gameAccount={gameAccount}
        logs={logsQuery.data?.logs ?? []}
        stageSubtitle={stageDisplay.subtitle}
        stageTitle={stageDisplay.title}
      />
    </DashboardPageFrame>
  );
}
