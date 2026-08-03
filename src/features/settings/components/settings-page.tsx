import type { PropsWithChildren } from 'react';
import { ScrollView, YStack } from 'tamagui';

import { HorizontalSwipeSurface, useSettingsTransitionDirection } from '@/components';

export function SettingsPage({
  children,
  isSwipeEnabled = true,
}: PropsWithChildren<{ isSwipeEnabled?: boolean }>) {
  const { direction, reducedMotion } = useSettingsTransitionDirection();
  const enterX = direction === 'forward' ? 28 : direction === 'backward' ? -28 : 0;

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
          opacity={1}
          x={0}
          transition={reducedMotion ? '0ms' : '300ms'}
          enterStyle={reducedMotion ? null : { opacity: 0, x: enterX }}
          $md={{ p: '$5', pb: '$9' }}
        >
          {children}
        </YStack>
      </HorizontalSwipeSurface>
    </ScrollView>
  );
}
