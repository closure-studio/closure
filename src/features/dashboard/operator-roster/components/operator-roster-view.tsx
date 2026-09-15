import { FlashList } from '@shopify/flash-list';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getTokens } from 'tamagui';

import { ResponsiveGridRow } from '@/components';
import { getResponsiveGridLayout, useResponsiveGridRows } from '@/hooks/use-responsive-grid-rows';
import type { OperatorDevelopmentCharacter } from '@/utils/operator-development/operator-development';
import { OperatorCard, OPERATOR_CARD_MIN_WIDTH, type OperatorCardLabels } from './operator-card';

const OPERATOR_ROW_GAP_TOKEN = '$2';
const EMPTY_DEVELOPMENT_TASK_IDS: ReadonlySet<string> = new Set();

export type OperatorViewModel = {
  name: string;
  operator: OperatorDevelopmentCharacter;
};

function getOperatorKey(viewModel: OperatorViewModel): string {
  return viewModel.operator.charId;
}

const OperatorRow = memo(function OperatorRow({
  developmentTaskIds,
  itemWidth,
  isLast,
  labels,
  onSelectOperator,
  row,
  gap,
}: {
  developmentTaskIds: ReadonlySet<string>;
  itemWidth: number | undefined;
  isLast: boolean;
  labels: OperatorCardLabels;
  onSelectOperator?: (viewModel: OperatorViewModel) => void;
  row: OperatorViewModel[];
  gap: number;
}) {
  return (
    <ResponsiveGridRow
      isLast={isLast}
      row={row}
      gap={gap}
      getItemKey={getOperatorKey}
      renderCell={(viewModel) => (
        <OperatorCard
          inDevelopmentPlan={developmentTaskIds.has(viewModel.operator.charId)}
          itemWidth={itemWidth}
          labels={labels}
          name={viewModel.name}
          operator={viewModel.operator}
          {...(onSelectOperator ? { onPress: () => onSelectOperator(viewModel) } : {})}
        />
      )}
    />
  );
});

export function OperatorRosterView({
  developmentTaskIds = EMPTY_DEVELOPMENT_TASK_IDS,
  onSelectOperator,
  operators,
}: {
  developmentTaskIds?: ReadonlySet<string>;
  onSelectOperator?: (viewModel: OperatorViewModel) => void;
  operators: readonly OperatorViewModel[];
}) {
  const { t } = useTranslation('dashboard');
  const gridGap = getTokens().space[OPERATOR_ROW_GAP_TOKEN].val;
  const labels = useMemo<OperatorCardLabels>(() => ({
    training: t('operators.cell.training'),
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
  const { rows, layout, handleLayout, keyExtractor } = useResponsiveGridRows(
    operators,
    (width) => getResponsiveGridLayout(width, gridGap, OPERATOR_CARD_MIN_WIDTH),
    getOperatorKey,
  );
  const { itemWidth } = layout;

  const renderItem = useCallback(
    ({ item: row, index: rowIndex }: { item: OperatorViewModel[]; index: number }) => (
      <OperatorRow
        developmentTaskIds={developmentTaskIds}
        isLast={rowIndex === rows.length - 1}
        itemWidth={itemWidth}
        labels={labels}
        row={row}
        gap={gridGap}
        {...(onSelectOperator ? { onSelectOperator } : {})}
      />
    ),
    [
      developmentTaskIds,
      gridGap,
      itemWidth,
      labels,
      onSelectOperator,
      rows.length,
    ],
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
