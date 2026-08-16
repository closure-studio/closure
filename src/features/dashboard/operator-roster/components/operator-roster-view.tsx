import { FlashList } from '@shopify/flash-list';
import { memo, useCallback } from 'react';
import { getTokens } from 'tamagui';

import { ResponsiveGridRow } from '@/components';
import { getResponsiveGridLayout, useResponsiveGridRows } from '@/hooks/use-responsive-grid-rows';
import { useLayoutSize } from '@/providers/layout-size-provider';
import type { Operator } from '@/schemas/game-account';
import type { LayoutSize } from '@/schemas/layout-size';
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
  columnCount,
  row,
  gap,
  rowIndex,
  size,
}: {
  columnCount: number;
  row: OperatorViewModel[];
  gap: number;
  rowIndex: number;
  size: LayoutSize;
}) {
  return (
    <ResponsiveGridRow
      row={row}
      gap={gap}
      getItemKey={getOperatorKey}
      renderCell={(viewModel, index) => (
        <OperatorCard
          displayIndex={rowIndex * columnCount + index}
          name={viewModel.name}
          operator={viewModel.operator}
          size={size}
        />
      )}
    />
  );
});

export function OperatorRosterView({
  operators,
}: {
  operators: readonly OperatorViewModel[];
}) {
  const layoutSize = useLayoutSize();
  const gridGap = getTokens().space[OPERATOR_ROW_GAP_TOKEN].val;
  const { rows, handleLayout, keyExtractor, layout } = useResponsiveGridRows(
    operators,
    (width) => getResponsiveGridLayout(width, gridGap, OPERATOR_CARD_MIN_WIDTH),
    getOperatorKey,
  );

  const renderItem = useCallback(
    ({ item: row, index: rowIndex }: { item: OperatorViewModel[]; index: number }) => (
      <OperatorRow
        columnCount={layout.columnCount}
        row={row}
        gap={gridGap}
        rowIndex={rowIndex}
        size={layoutSize}
      />
    ),
    [gridGap, layout.columnCount, layoutSize],
  );

  return (
    <FlashList
      data={rows}
      keyExtractor={keyExtractor}
      onLayout={handleLayout}
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      testID="operator-roster-list"
      renderItem={renderItem}
    />
  );
}
