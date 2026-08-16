import { FlashList } from '@shopify/flash-list';
import { memo, useCallback } from 'react';
import { getTokens } from 'tamagui';

import { ResponsiveGridRow } from '@/components';
import { getResponsiveGridLayout, useResponsiveGridRows } from '@/hooks/use-responsive-grid-rows';
import type { Operator } from '@/schemas/game-account';
import { OperatorCard, OPERATOR_CARD_MIN_WIDTH } from './operator-card';

const OPERATOR_ROW_GAP_TOKEN = '$2';

export type OperatorViewModel = {
  charId: string;
  name: string;
  operator: Operator;
};

function getOperatorKey(viewModel: OperatorViewModel): string {
  return viewModel.charId;
}

const OperatorRow = memo(function OperatorRow({
  row,
  gap,
}: {
  row: OperatorViewModel[];
  gap: number;
}) {
  return (
    <ResponsiveGridRow
      row={row}
      gap={gap}
      getItemKey={getOperatorKey}
      renderCell={(viewModel) => (
        <OperatorCard name={viewModel.name} operator={viewModel.operator} />
      )}
    />
  );
});

export function OperatorRosterView({
  operators,
}: {
  operators: readonly OperatorViewModel[];
}) {
  const gridGap = getTokens().space[OPERATOR_ROW_GAP_TOKEN].val;
  const { rows, handleLayout, keyExtractor } = useResponsiveGridRows(
    operators,
    (width) => getResponsiveGridLayout(width, gridGap, OPERATOR_CARD_MIN_WIDTH),
    getOperatorKey,
  );

  const renderItem = useCallback(
    ({ item: row }: { item: OperatorViewModel[] }) => (
      <OperatorRow row={row} gap={gridGap} />
    ),
    [gridGap],
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
