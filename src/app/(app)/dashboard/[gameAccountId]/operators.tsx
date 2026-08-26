import { useMemo } from 'react';

import {
  DashboardPageFrame,
  getCharacterDisplayName,
  OperatorRosterView,
  useCharacterTable,
  useDashboardRoute,
  useCharactersQuery,
} from '@/features/dashboard';

export default function DashboardOperatorsRoute() {
  const { gameAccountId } = useDashboardRoute();
  const characters = useCharactersQuery(gameAccountId).data;
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
