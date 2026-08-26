import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { useLayoutSize } from '@/providers/layout-size-provider';
import { LargeScreenNavigationSidebar } from './large-screen-navigation-sidebar';
import type { DesktopNavigationItem } from './large-screen-navigation-sidebar';
import type { NavigationScope } from '../navigation-config';

type NavigationFrameProps = {
  activeId: string;
  children: ReactNode;
  header?: ReactNode;
  items: readonly DesktopNavigationItem[];
  onLogout: () => void;
  onSelect: (itemId: string) => void;
  onToggleScope: () => void;
  scope: NavigationScope;
  smallScreenEdges: readonly Edge[];
};

export function NavigationFrame({
  activeId,
  children,
  header,
  items,
  onLogout,
  onSelect,
  onToggleScope,
  scope,
  smallScreenEdges,
}: NavigationFrameProps) {
  const layoutSize = useLayoutSize();

  return (
    <SafeAreaView
      edges={layoutSize === 'small' ? smallScreenEdges : ['bottom']}
      style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
    >
      <YStack grow={1} height="100%" maxH="100%" overflow="hidden">
        <XStack grow={1} shrink={1} minH={0}>
          <LargeScreenNavigationSidebar
            activeId={activeId}
            items={items}
            onLogout={onLogout}
            onSelect={onSelect}
            onToggleScope={onToggleScope}
            scope={scope}
          />

          <YStack grow={1} shrink={1} minW={0} minH={0}>
            {header ? (
              <YStack testID="navigation-frame-header" shrink={0}>
                {header}
              </YStack>
            ) : null}

            <YStack grow={1} shrink={1} minW={0} minH={0} overflow="hidden">
              {children}
            </YStack>
          </YStack>
        </XStack>
      </YStack>
    </SafeAreaView>
  );
}
