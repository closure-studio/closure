import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { getTokens } from 'tamagui';

import { ResponsiveGridRow } from '@/components';
import { getResponsiveGridLayout, useResponsiveGridRows } from '@/hooks/use-responsive-grid-rows';
import type { Operator } from '@/schemas/game-account';
import { OperatorCard, OPERATOR_CARD_MIN_WIDTH } from './operator-card';

const OPERATOR_ROW_GAP_TOKEN = '$2';

function getOperatorKey(operator: Operator): string {
  return operator.charId;
}

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
    (width) => getResponsiveGridLayout(width, gridGap, OPERATOR_CARD_MIN_WIDTH),
    getOperatorKey,
  );

  const renderItem = useCallback(
    ({ item: row }: { item: Operator[] }) => (
      <ResponsiveGridRow
        row={row}
        gap={gridGap}
        getItemKey={getOperatorKey}
        renderCell={(operator) => (
          <OperatorCard name={getCharacterName(operator.charId)} operator={operator} />
        )}
      />
    ),
    [getCharacterName, gridGap],
  );

  return (
    <FlashList
      data={rows}
      keyExtractor={keyExtractor}
      onLayout={handleLayout}
      style={{ flex: 1 }}
      testID="operator-roster-list"
      renderItem={renderItem}
    />
  );
}