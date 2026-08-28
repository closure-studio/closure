import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, YStack, useMedia } from 'tamagui';

export function SettingsPage({ children, header }: PropsWithChildren<{ header?: ReactNode }>) {
  const { large } = useMedia();
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
        $large={{ p: '$5', pb: '$9' }}
      >
        {header && large ? header : null}
        {children}
      </YStack>
    </ScrollView>
  );
}
