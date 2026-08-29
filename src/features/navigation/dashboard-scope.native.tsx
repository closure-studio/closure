import type { PropsWithChildren } from 'react';
import { useIsFocused } from 'expo-router';
import { YStack } from 'tamagui';

export function DashboardScope({ children }: PropsWithChildren) {
  const isFocused = useIsFocused();

  return (
    <YStack testID="dashboard-scope" grow={1} minH={0} opacity={isFocused ? 1 : 0}>
      {children}
    </YStack>
  );
}
