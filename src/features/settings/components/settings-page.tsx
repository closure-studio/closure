import type { PropsWithChildren } from 'react';
import { ScrollView, YStack } from 'tamagui';

export function SettingsPage({ children }: PropsWithChildren) {
  return (
    <ScrollView
      grow={1}
      shrink={1}
      minH={0}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ grow: 1 }}
    >
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
    </ScrollView>
  );
}
