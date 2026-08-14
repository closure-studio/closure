import { useMappingHelper } from '@shopify/flash-list';
import { Fragment } from 'react';
import type { ReactElement } from 'react';
import { XStack } from 'tamagui';

export type ResponsiveGridRowProps<T> = {
  row: readonly T[];
  gap: number;
  getItemKey: (item: T) => string;
  renderCell: (item: T, index: number) => ReactElement;
};

export function ResponsiveGridRow<T>({ row, gap, getItemKey, renderCell }: ResponsiveGridRowProps<T>) {
  const { getMappingKey } = useMappingHelper();
  return (
    <XStack gap={gap} pb={gap} width="100%">
      {row.map((item, index) => (
        <Fragment key={getMappingKey(getItemKey(item), index)}>
          {renderCell(item, index)}
        </Fragment>
      ))}
    </XStack>
  );
}
