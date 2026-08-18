import { FlashList } from '@shopify/flash-list';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getTokens } from 'tamagui';

import { ResponsiveGridRow } from '@/components';
import { getResponsiveGridLayout, useResponsiveGridRows } from '@/hooks/use-responsive-grid-rows';
import { useLayoutSize } from '@/providers/layout-size-provider';
import type { Operator } from '@/schemas/game-account';
import type { LayoutSize } from '@/schemas/layout-size';
import { OperatorCard, OPERATOR_CARD_MIN_WIDTH, type OperatorCardLabels } from './operator-card';

const OPERATOR_ROW_GAP_TOKEN = '$2';

export type OperatorViewModel = {
  name: string;
  operator: Operator;
};

function getOperatorKey(viewModel: OperatorViewModel): string {
  return viewModel.operator.charId;
}

const OperatorRow = memo(function OperatorRow({
  isLast,
  labels,
  row,
  gap,
  size,
}: {
  isLast: boolean;
  labels: OperatorCardLabels;
  row: OperatorViewModel[];
  gap: number;
  size: LayoutSize;
}) {
  return (
    <ResponsiveGridRow
      isLast={isLast}
      row={row}
      gap={gap}
      getItemKey={getOperatorKey}
      renderCell={(viewModel) => (
        <OperatorCard
          labels={labels}
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
  const { t } = useTranslation('dashboard');
  const layoutSize = useLayoutSize();
  const gridGap = getTokens().space[OPERATOR_ROW_GAP_TOKEN].val;
  const labels = useMemo<OperatorCardLabels>(() => ({
    cellLevel: t('operators.cell.levelLabel'),
    detailLevel: t('operators.detail.level'),
    detailPotential: t('operators.detail.potential'),
    elite: {
      0: t('operators.cell.eliteLabel', { rank: 0 }),
      1: t('operators.cell.eliteLabel', { rank: 1 }),
      2: t('operators.cell.eliteLabel', { rank: 2 }),
    },
    potential: {
      0: t('operators.cell.potentialLabel', { rank: 1 }),
      1: t('operators.cell.potentialLabel', { rank: 2 }),
      2: t('operators.cell.potentialLabel', { rank: 3 }),
      3: t('operators.cell.potentialLabel', { rank: 4 }),
      4: t('operators.cell.potentialLabel', { rank: 5 }),
      5: t('operators.cell.potentialLabel', { rank: 6 }),
    },
  }), [t]);
  const { rows, handleLayout, keyExtractor } = useResponsiveGridRows(
    operators,
    (width) => getResponsiveGridLayout(width, gridGap, OPERATOR_CARD_MIN_WIDTH),
    getOperatorKey,
  );

  const renderItem = useCallback(
    ({ item: row, index: rowIndex }: { item: OperatorViewModel[]; index: number }) => (
      <OperatorRow
        isLast={rowIndex === rows.length - 1}
        labels={labels}
        row={row}
        gap={gridGap}
        size={layoutSize}
      />
    ),
    [gridGap, labels, layoutSize, rows.length],
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
