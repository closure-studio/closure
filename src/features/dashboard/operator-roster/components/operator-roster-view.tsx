import { FlashList, useMappingHelper } from '@shopify/flash-list';
import { memo, useCallback } from 'react';
import { XStack, getTokens } from 'tamagui';

import { useResponsiveGridRows } from '@/hooks/use-responsive-grid-rows';
import type { Operator } from '@/schemas/game-account';
import { OperatorCard, OPERATOR_CARD_MIN_WIDTH } from './operator-card';

const OPERATOR_ROW_GAP_TOKEN = '$2';

function getOperatorKey(operator: Operator): string {
  return operator.charId;
}

function getOperatorColumnCount(containerWidth: number, gap: number): number {
  if (containerWidth <= 0) return 1;
  return Math.max(
    1,
    Math.floor((containerWidth + gap) / (OPERATOR_CARD_MIN_WIDTH + gap)),
  );
}

const OperatorRow = memo(function OperatorRow({
  row,
  getCharacterName,
}: {
  row: Operator[];
  getCharacterName: (characterId: string) => string;
}) {
  const { getMappingKey } = useMappingHelper();
  return (
    <XStack gap={OPERATOR_ROW_GAP_TOKEN} pb={OPERATOR_ROW_GAP_TOKEN} width="100%">
      {row.map((operator, index) => (
        <OperatorCard
          key={getMappingKey(operator.charId, index)}
          name={getCharacterName(operator.charId)}
          operator={operator}
        />
      ))}
    </XStack>
  );
});

export function OperatorRosterView({
  getCharacterName,
  operators,
}: {
  getCharacterName: (characterId: string) => string;
  operators: readonly Operator[];
}) {
  const gridGap = getTokens().space[OPERATOR_ROW_GAP_TOKEN].val;
  const { rows, handleLayout, keyExtractor } = useResponsiveGridRows(
    operators,
    (width) => ({ columnCount: getOperatorColumnCount(width, gridGap) }),
    getOperatorKey,
  );

  const renderItem = useCallback(
    ({ item: row }: { item: Operator[] }) => (
      <OperatorRow row={row} getCharacterName={getCharacterName} />
    ),
    [getCharacterName],
  );

  return (
    <FlashList
      data={rows}
      keyExtractor={keyExtractor}
      onLayout={handleLayout}
      style={{ flex: 1 }}
      renderItem={renderItem}
    />
  );
}
