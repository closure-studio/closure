import type { PropsWithChildren } from 'react';
import { ScrollView, YStack } from 'tamagui';

import { HorizontalSwipeSurface } from '@/components';
import type { HorizontalSwipeDirection } from '@/components';
import { DashboardSecondaryHeader, type DashboardSecondaryHeaderProps } from './dashboard-secondary-header';

const DASHBOARD_CONTENT_MAX_WIDTH = 1152;

type DashboardShellProps = DashboardSecondaryHeaderProps & {
  isContentSwipeEnabled: boolean;
  onContentSwipe: (direction: HorizontalSwipeDirection) => void;
};

export function DashboardShell({
  children,
  isContentSwipeEnabled,
  onContentSwipe,
  ...headerProps
}: PropsWithChildren<DashboardShellProps>) {
  return (
    <YStack grow={1} shrink={1} minH={0} overflow="hidden">
      <DashboardSecondaryHeader {...headerProps} />
      <HorizontalSwipeSurface
        enabled={isContentSwipeEnabled}
        onSwipe={onContentSwipe}
      >
        <YStack grow={1} shrink={1} minH={0}>
          {children}
        </YStack>
      </HorizontalSwipeSurface>
    </YStack>
  );
}

export function DashboardPageScroll({ children }: PropsWithChildren) {
  return (
    <YStack grow={1} shrink={1} minW={0} minH={0} height="100%" maxH="100%" overflow="hidden">
      <ScrollView
        grow={1}
        shrink={1}
        minH={0}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ grow: 1 }}
      >
        <YStack
          width="100%"
          maxW={DASHBOARD_CONTENT_MAX_WIDTH}
          self="center"
          p="$3.5"
          pt="$3"
          $md={{ p: '$5', pt: '$4' }}
        >
          {children}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
