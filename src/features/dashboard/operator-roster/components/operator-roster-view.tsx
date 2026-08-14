import { XStack, YStack } from 'tamagui';

import type { Operator } from '@/schemas/game-account';
import { OperatorCard } from './operator-card';

export function OperatorRosterView({
  getCharacterName,
  operators,
}: {
  getCharacterName: (characterId: string) => string;
  operators: readonly Operator[];
}) {
  return (
    <YStack pb="$4">
      <XStack flexWrap="wrap" gap="$2">
        {operators.map((operator) => (
          <OperatorCard
            key={operator.charId}
            name={getCharacterName(operator.charId)}
            operator={operator}
          />
        ))}
      </XStack>
    </YStack>
  );
}