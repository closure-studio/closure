import type { PropsWithChildren } from 'react';
import { YStack } from 'tamagui';

import { DashboardSecondaryHeader, type DashboardSecondaryHeaderProps } from './dashboard-secondary-header';

export function DashboardShell({ children, ...headerProps }: PropsWithChildren<DashboardSecondaryHeaderProps>) {
  return (
    <YStack grow={1} shrink={1} minH={0} overflow="hidden">
      <DashboardSecondaryHeader {...headerProps} />
      <YStack grow={1} shrink={1} minH={0}>
        {children}
      </YStack>
    </YStack>
  );
}
