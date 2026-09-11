import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { YStack } from "tamagui";

import { ARK_HOST_GAME_STATUS_CODE } from "@/schemas/arkhost";
import type { GameAccount } from "@/schemas/game-account";
import {
  setOperatorDevelopmentTask,
  validateOperatorDevelopmentTarget,
  type OperatorDevelopmentTarget,
  type OperatorDevelopmentTask,
} from "@/utils/operator-development/operator-development";
import { GameAccountActions } from "../components/game-account-actions";
import { DashboardPageFrame } from "../components/dashboard-shell";
import { GameAccountOverviewView } from "../components/game-account-overview-view";
import { getCharacterDisplayName, getStageDisplayParts } from "../game-data";
import {
  EMPTY_INVENTORY,
  InventoryView,
} from "../inventory/components/inventory-view";
import { OperatorDevelopmentDialog } from "../operator-roster/components/operator-development-dialog";
import {
  OperatorRosterView,
  type OperatorViewModel,
} from "../operator-roster/components/operator-roster-view";
import {
  useDeleteGame,
  useGameDetailQuery,
  useGameLogsQuery,
  useLoginGame,
  usePauseGame,
  useUpdateGameConfig,
} from "../queries";
import { useCharacterTable, useItemTable, useStageTable } from "../resources";

const EMPTY_OPERATOR_DEVELOPMENT_TASKS: readonly OperatorDevelopmentTask[] = [];

export function DashboardOverviewContent({
  gameAccount,
}: {
  gameAccount: GameAccount;
}) {
  const { t } = useTranslation("dashboard");
  const deleteGame = useDeleteGame();
  const loginGame = useLoginGame();
  const pauseGame = usePauseGame();
  const detailQuery = useGameDetailQuery(gameAccount.account);
  const logsQuery = useGameLogsQuery(gameAccount.account);
  const stageTable = useStageTable();
  const stageDisplay = getStageDisplayParts(
    stageTable,
    detailQuery.data?.config.current_map ?? "",
    "—",
  );

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
          error={
            deleteGame.isError || loginGame.isError || pauseGame.isError
              ? t("overview.actions.failed")
              : null
          }
          onToggle={() => {
            deleteGame.reset();
            if (
              gameAccount.statusCode === ARK_HOST_GAME_STATUS_CODE.notStarted
            ) {
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

export function DashboardInventoryContent({
  gameAccount,
}: {
  gameAccount: GameAccount;
}) {
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

export function DashboardOperatorsContent({
  gameAccount,
}: {
  gameAccount: GameAccount;
}) {
  const detail = useGameDetailQuery(gameAccount.account).data;
  const troop = detail?.troop;
  const characterTable = useCharacterTable();
  const updateGameConfig = useUpdateGameConfig();
  const [operatorSelection, setOperatorSelection] = useState<{
    account: string;
    charId: string | null;
  }>({ account: gameAccount.account, charId: null });
  const [developmentOpen, setDevelopmentOpen] = useState(false);
  const operators = useMemo(
    () =>
      Object.values(troop?.chars ?? {}).map((operator) => ({
        name: getCharacterDisplayName(characterTable, operator.charId),
        operator,
      })),
    [characterTable, troop],
  );
  const selected =
    (operatorSelection.account === gameAccount.account &&
    operatorSelection.charId !== null
      ? operators.find(
          ({ operator }) => operator.charId === operatorSelection.charId,
        )
      : undefined) ??
    operators[0] ??
    null;
  const tasks =
    detail?.config.operator_development_tasks ??
    EMPTY_OPERATOR_DEVELOPMENT_TASKS;
  const developmentTaskIds = useMemo(
    () => new Set(tasks.map((task) => task.char_id)),
    [tasks],
  );
  const selectedTask =
    selected === null
      ? null
      : (tasks.find((task) => task.char_id === selected.operator.charId) ??
        null);

  const submitDevelopmentTarget = async (
    selectedOperator: OperatorViewModel,
    target: OperatorDevelopmentTarget | null,
  ) => {
    const rarity = characterTable[selectedOperator.operator.charId]?.rarity;
    if (
      target !== null &&
      (rarity === undefined ||
        !validateOperatorDevelopmentTarget(
          selectedOperator.operator,
          rarity,
          target,
        ))
    ) {
      throw new Error("Invalid operator development target.");
    }
    const nextTasks = setOperatorDevelopmentTask(
      tasks,
      selectedOperator.operator.charId,
      target,
    );
    await updateGameConfig.mutateAsync({
      account: gameAccount.account,
      patch: { operator_development_tasks: nextTasks },
    });
  };

  return (
    <DashboardPageFrame flushBottom>
      <YStack width="100%" grow={1} minH={0}>
        <OperatorRosterView
          developmentTaskIds={developmentTaskIds}
          operators={operators}
          onSelectOperator={({ operator }) => {
            updateGameConfig.reset();
            setOperatorSelection({
              account: gameAccount.account,
              charId: operator.charId,
            });
            setDevelopmentOpen(true);
          }}
        />
        <OperatorDevelopmentDialog
          hasError={updateGameConfig.isError}
          isSubmitting={updateGameConfig.isPending}
          open={
            developmentOpen &&
            operatorSelection.account === gameAccount.account
          }
          selection={
            selected
              ? {
                  name: selected.name,
                  operator: selected.operator,
                  rarity:
                    characterTable[selected.operator.charId]?.rarity ?? null,
                  task: selectedTask,
                }
              : null
          }
          onOpenChange={setDevelopmentOpen}
          onSubmit={async (target) => {
            if (selected === null) return;
            await submitDevelopmentTarget(selected, target);
          }}
        />
      </YStack>
    </DashboardPageFrame>
  );
}
