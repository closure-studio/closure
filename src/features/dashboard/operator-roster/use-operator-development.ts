import { useMemo, useState } from 'react';

import type { OperatorDevelopmentTarget, OperatorDevelopmentTask } from '@/utils/operator-development/operator-development';
import { setOperatorDevelopmentTask } from '@/utils/operator-development/operator-development';
import { getCharacterDisplayName } from '../game-data';
import { useGameDetailQuery, useUpdateGameConfig } from '../queries';
import { useCharacterTable } from '../resources';
import type { OperatorViewModel } from './components/operator-roster-view';

const EMPTY_OPERATOR_DEVELOPMENT_TASKS: readonly OperatorDevelopmentTask[] = [];

export function useOperatorDevelopment(account: string) {
  const detail = useGameDetailQuery(account).data;
  const characterTable = useCharacterTable();
  const updateGameConfig = useUpdateGameConfig(account);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);
  const operators = useMemo(
    () => Object.values(detail?.troop?.chars ?? {}).map((operator) => ({
      name: getCharacterDisplayName(characterTable, operator.charId),
      operator,
    })),
    [characterTable, detail?.troop],
  );
  const tasks = detail?.config.operator_development_tasks ?? EMPTY_OPERATOR_DEVELOPMENT_TASKS;
  const developmentTaskIds = useMemo(
    () => new Set(tasks.map((task) => task.char_id)),
    [tasks],
  );
  const selected = selectedOperatorId === null
    ? null
    : operators.find(({ operator }) => operator.charId === selectedOperatorId) ?? null;
  const selection = selected === null
    ? null
    : {
        name: selected.name,
        operator: selected.operator,
        rarity: characterTable[selected.operator.charId]?.rarity ?? null,
        task: tasks.find((task) => task.char_id === selected.operator.charId) ?? null,
      };

  const selectOperator = ({ operator }: OperatorViewModel) => {
    if (updateGameConfig.isPending) return;
    updateGameConfig.reset();
    setSelectedOperatorId(operator.charId);
  };

  const setOpen = (open: boolean) => {
    if (!open && !updateGameConfig.isPending) setSelectedOperatorId(null);
  };

  const submitTarget = (target: OperatorDevelopmentTarget | null) => {
    if (selected === null) return;
    const submittedOperatorId = selected.operator.charId;
    const nextTasks = setOperatorDevelopmentTask(tasks, submittedOperatorId, target);
    updateGameConfig.mutate(
      { operator_development_tasks: nextTasks },
      {
        onSuccess: () => {
          setSelectedOperatorId((current) => (
            current === submittedOperatorId ? null : current
          ));
        },
      },
    );
  };

  return {
    developmentTaskIds,
    hasError: updateGameConfig.isError,
    isSubmitting: updateGameConfig.isPending,
    operators,
    selection,
    setOpen,
    selectOperator,
    submitTarget,
  };
}
