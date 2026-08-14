import { useCallback } from 'react';

import {
  DashboardPageFrame,
  getCharacterDisplayName,
  OperatorRosterView,
  useSelectedCharacters,
  useCharacterTable,
} from '@/features/dashboard';

export default function DashboardOperatorsRoute() {
  const characters = useSelectedCharacters();
  const characterTable = useCharacterTable();
  const getCharacterName = useCallback(
    (characterId: string) => getCharacterDisplayName(characterTable, characterId),
    [characterTable],
  );

  return (
    <DashboardPageFrame>
      <OperatorRosterView
        getCharacterName={getCharacterName}
        operators={characters.chars}
      />
    </DashboardPageFrame>
  );
}