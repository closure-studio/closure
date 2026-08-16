import { useMappingHelper } from '@shopify/flash-list';
import { Fragment } from 'react';
import type { ReactElement } from 'react';
import { XStack } from 'tamagui';

export type ResponsiveGridRowProps<T> = {
  isLast: boolean;
  row: readonly T[];
  gap: number;
  getItemKey: (item: T) => string;
  renderCell: (item: T, index: number) => ReactElement;
};

export function ResponsiveGridRow<T>({ isLast, row, gap, getItemKey, renderCell }: ResponsiveGridRowProps<T>) {
  const { getMappingKey } = useMappingHelper();
  return (
    <XStack gap={gap} pb={isLast ? 0 : gap} width="100%">
      {row.map((item, index) => (
        <Fragment key={getMappingKey(getItemKey(item), index)}>
          {renderCell(item, index)}
        </Fragment>
      ))}
    </XStack>
  );
}
