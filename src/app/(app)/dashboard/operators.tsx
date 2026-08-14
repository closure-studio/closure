import {
  DashboardPageScroll,
  getCharacterDisplayName,
  OperatorRosterView,
  useSelectedCharacters,
  useCharacterTable,
} from '@/features/dashboard';

export default function DashboardOperatorsRoute() {
  const characters = useSelectedCharacters();
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