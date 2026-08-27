import type { PropsWithChildren } from 'react';
import { ScrollView, YStack } from 'tamagui';

import { DashboardSecondaryHeader, type DashboardSecondaryHeaderProps } from './dashboard-secondary-header';

const DASHBOARD_CONTENT_MAX_WIDTH = 1152;

type DashboardShellProps = DashboardSecondaryHeaderProps;

export function DashboardShell({
  children,
  ...headerProps
}: PropsWithChildren<DashboardShellProps>) {
  return (
    <YStack grow={1} shrink={1} minH={0} overflow="hidden">
      <DashboardSecondaryHeader {...headerProps} />
      <YStack grow={1} shrink={1} minH={0}>
        {children}
      </YStack>
    </YStack>
  );
}

export function DashboardPageFrame({
  children,
  flushBottom = false,
  scroll = false,
}: PropsWithChildren<{ flushBottom?: boolean; scroll?: boolean }>) {
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
      pb={flushBottom ? '$0' : '$3.5'}
      $large={{ px: '$5', pt: '$4', pb: '$3.5' }}
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
