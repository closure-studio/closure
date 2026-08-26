import { useMemo } from 'react';

import type { GameAccount } from '@/schemas/game-account';
import { DashboardPageFrame } from '../components/dashboard-shell';
import { GameAccountOverviewView } from '../components/game-account-overview-view';
import { getCharacterDisplayName, getStageDisplayParts } from '../game-data';
import { EMPTY_INVENTORY, InventoryView } from '../inventory/components/inventory-view';
import { OperatorRosterView } from '../operator-roster/components/operator-roster-view';
import {
  useCharactersQuery,
  useGameDetailQuery,
  useGameLogsQuery,
} from '../queries';
import {
  useCharacterTable,
  useItemTable,
  useStageTable,
} from '../resources';

export function DashboardOverviewContent({ gameAccount }: { gameAccount: GameAccount }) {
  const detailQuery = useGameDetailQuery(gameAccount.account);
  const logsQuery = useGameLogsQuery(gameAccount.account);
  const stageTable = useStageTable();
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

export function DashboardInventoryContent({ gameAccount }: { gameAccount: GameAccount }) {
  const detail = useGameDetailQuery(gameAccount.account).data;
  const itemTable = useItemTable();

  return (
    <DashboardPageFrame flushBottom>
      <InventoryView
        accountId={gameAccount.account}
        inventory={detail?.inventory ?? EMPTY_INVENTORY}
        itemTable={itemTable}
      />
    </DashboardPageFrame>
  );
}

export function DashboardOperatorsContent({ gameAccount }: { gameAccount: GameAccount }) {
  const characters = useCharactersQuery(gameAccount.account).data;
  const characterTable = useCharacterTable();
  const operators = useMemo(
    () => (characters?.chars ?? []).map((operator) => ({
      name: getCharacterDisplayName(characterTable, operator.charId),
      operator,
    })),
    [characterTable, characters?.chars],
  );

  return (
    <DashboardPageFrame flushBottom>
      <OperatorRosterView operators={operators} />
    </DashboardPageFrame>
  );
}
