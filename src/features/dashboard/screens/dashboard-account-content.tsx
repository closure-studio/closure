import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ARK_HOST_GAME_STATUS_CODE } from '@/schemas/arkhost';
import type { GameAccount } from '@/schemas/game-account';
import { GameAccountActions } from '../components/game-account-actions';
import { DashboardPageFrame } from '../components/dashboard-shell';
import { GameAccountOverviewView } from '../components/game-account-overview-view';
import { getCharacterDisplayName, getStageDisplayParts } from '../game-data';
import { EMPTY_INVENTORY, InventoryView } from '../inventory/components/inventory-view';
import { OperatorRosterView } from '../operator-roster/components/operator-roster-view';
import {
  useDeleteGame,
  useGameDetailQuery,
  useGameLogsQuery,
  useLoginGame,
  usePauseGame,
} from '../queries';
import {
  useCharacterTable,
  useItemTable,
  useStageTable,
} from '../resources';

export function DashboardOverviewContent({ gameAccount }: { gameAccount: GameAccount }) {
  const { t } = useTranslation('dashboard');
  const deleteGame = useDeleteGame();
  const loginGame = useLoginGame();
  const pauseGame = usePauseGame();
  const detailQuery = useGameDetailQuery(gameAccount.account);
  const logsQuery = useGameLogsQuery(gameAccount.account);
  const stageTable = useStageTable();
  const stageDisplay = getStageDisplayParts(stageTable, gameAccount.config.current_map, '—');

  return (
    <DashboardPageFrame scroll>
      <GameAccountOverviewView
        detail={detailQuery.data ?? null}
        gameAccount={gameAccount}
        logs={logsQuery.data?.logs ?? []}
        stageSubtitle={stageDisplay.subtitle}
        stageTitle={stageDisplay.title}
      >
        <GameAccountActions
          account={gameAccount.account}
          nickname={gameAccount.nickname}
          statusCode={gameAccount.statusCode}
          actionPending={loginGame.isPending || pauseGame.isPending}
          deletePending={deleteGame.isPending}
          error={deleteGame.isError || loginGame.isError || pauseGame.isError
            ? t('overview.actions.failed')
            : null}
          onToggle={() => {
            deleteGame.reset();
            if (gameAccount.statusCode === ARK_HOST_GAME_STATUS_CODE.notStarted) {
              pauseGame.reset();
              loginGame.mutate(gameAccount.account);
            } else {
              loginGame.reset();
              pauseGame.mutate(gameAccount.account);
            }
          }}
          onDelete={() => {
            loginGame.reset();
            pauseGame.reset();
            deleteGame.mutate(gameAccount.account);
          }}
        />
      </GameAccountOverviewView>
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
  const troop = useGameDetailQuery(gameAccount.account).data?.troop;
  const characterTable = useCharacterTable();
  const operators = useMemo(
    () => Object.values(troop?.chars ?? {}).map((operator) => ({
      name: getCharacterDisplayName(characterTable, operator.charId),
      operator,
    })),
    [characterTable, troop],
  );

  return (
    <DashboardPageFrame flushBottom>
      <OperatorRosterView operators={operators} />
    </DashboardPageFrame>
  );
}
