import type { PropsWithChildren } from 'react';
import { YStack } from 'tamagui';

export function DashboardScope({ children }: PropsWithChildren) {
  return (
    <YStack testID="dashboard-scope" grow={1} minH={0}>
      {children}
    </YStack>
  );
}
