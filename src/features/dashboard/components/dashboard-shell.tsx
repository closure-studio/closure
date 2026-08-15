import type { PropsWithChildren } from 'react';
import { ScrollView, YStack } from 'tamagui';

import { HorizontalSwipeSurface } from '@/components';
import type { HorizontalSwipeDirection } from '@/utils/horizontal-swipe';
import { DashboardSecondaryHeader } from './dashboard-secondary-header';

const DASHBOARD_CONTENT_MAX_WIDTH = 1152;

type DashboardShellProps = {
  isContentSwipeEnabled: boolean;
  onContentSwipe: (direction: HorizontalSwipeDirection) => void;
};

export function DashboardShell({
  children,
  isContentSwipeEnabled,
  onContentSwipe,
}: PropsWithChildren<DashboardShellProps>) {
  return (
    <YStack grow={1} shrink={1} minH={0} overflow="hidden">
      <DashboardSecondaryHeader />
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

export function DashboardPageFrame({ children, scroll = false }: PropsWithChildren<{ scroll?: boolean }>) {
  const frame = (
    <YStack
      testID="dashboard-page-frame"
      width="100%"
      maxW={DASHBOARD_CONTENT_MAX_WIDTH}
      self="center"
      grow={1}
      shrink={1}
      minW={0}
      minH={0}
      p="$3.5"
      pt="$3"
      $md={{ px: '$5', pt: '$4' }}
    >
      {children}
    </YStack>
  );

  if (!scroll) return frame;

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
        {frame}
      </ScrollView>
    </YStack>
  );
}

export function DashboardPageScroll({ children }: PropsWithChildren) {
  return <DashboardPageFrame scroll>{children}</DashboardPageFrame>;
}
