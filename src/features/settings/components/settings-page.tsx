import type { PropsWithChildren } from 'react';
import { ScrollView, YStack } from 'tamagui';

import { HorizontalSwipeSurface } from '@/components';

export function SettingsPage({
  children,
  isSwipeEnabled = true,
}: PropsWithChildren<{ isSwipeEnabled?: boolean }>) {
  return (
    <ScrollView
      grow={1}
      shrink={1}
      minH={0}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ grow: 1 }}
    >
      <HorizontalSwipeSurface enabled={isSwipeEnabled}>
        <YStack
          grow={1}
          width="100%"
          maxW={1180}
          self="center"
          p="$3.5"
          pb="$8"
          gap="$5"
          $md={{ p: '$5', pb: '$9' }}
        >
          {children}
        </YStack>
      </HorizontalSwipeSurface>
    </ScrollView>
  );
}
