import { useMemo } from 'react';

import {
  DashboardPageFrame,
  getCharacterDisplayName,
  OperatorRosterView,
  useCharacterTable,
  useSelectedCharactersQuery,
} from '@/features/dashboard';

export default function DashboardOperatorsRoute() {
  const characters = useSelectedCharactersQuery().data;
  const characterTable = useCharacterTable();

  const operators = useMemo(
    () => (characters?.chars ?? []).map((operator) => ({
      charId: operator.charId,
      name: getCharacterDisplayName(characterTable, operator.charId),
      operator,
    })),
    [characterTable, characters?.chars],
  );

  return (
    <DashboardPageFrame>
      <OperatorRosterView operators={operators} />
    </DashboardPageFrame>
  );
}
