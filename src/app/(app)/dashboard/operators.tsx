import {
  DashboardPageScroll,
  getCharacterDisplayName,
  OperatorRosterView,
} from '@/features/dashboard';
import { selectActiveCharacters, selectCharacterTable, useAppStore } from '@/store';

export default function DashboardOperatorsRoute() {
  const characters = useAppStore(selectActiveCharacters);
  const characterTable = useAppStore(selectCharacterTable);

  return (
    <DashboardPageScroll>
      <OperatorRosterView
        getCharacterName={(characterId) => getCharacterDisplayName(characterTable, characterId)}
        operators={characters.chars}
      />
    </DashboardPageScroll>
  );
}
