import {
  DashboardPageScroll,
  getCharacterDisplayName,
  OperatorRosterView,
  useActiveCharacters,
  useCharacterTable,
} from '@/features/dashboard';

export default function DashboardOperatorsRoute() {
  const characters = useActiveCharacters();
  const characterTable = useCharacterTable();

  return (
    <DashboardPageScroll>
      <OperatorRosterView
        getCharacterName={(characterId) => getCharacterDisplayName(characterTable, characterId)}
        operators={characters.chars}
      />
    </DashboardPageScroll>
  );
}