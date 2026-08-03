import type { PropsWithChildren } from 'react';
import Animated from 'react-native-reanimated';
import { Button, XStack, YStack } from 'tamagui';

import {
  HorizontalSwipeSurface,
  MonoText,
  TerminalText,
} from '@/components';
import type { HorizontalSwipeDirection } from '@/components';
import type { SettingsPageId } from '../navigation-config';

type SettingsPagerItem = {
  id: SettingsPageId;
  label: string;
};

export type SettingsSwipeAction =
  | { type: 'exit' }
  | { pageId: SettingsPageId; type: 'select-page' };

export function resolveSettingsSwipeAction({
  activeId,
  direction,
  items,
}: {
  activeId: SettingsPageId;
  direction: HorizontalSwipeDirection;
  items: readonly { id: SettingsPageId }[];
}): SettingsSwipeAction | null {
  const activeIndex = items.findIndex((item) => item.id === activeId);
  if (activeIndex < 0) return null;

  if (activeIndex === 0 && direction === 'right') {
    return { type: 'exit' };
  }

  const nextIndex = direction === 'left' ? activeIndex + 1 : activeIndex - 1;
  const nextPage = items[nextIndex];
  return nextPage ? { pageId: nextPage.id, type: 'select-page' } : null;
}

export function SettingsSwipePager({
  activeId,
  children,
  hint,
  items,
  onSelect,
}: PropsWithChildren<{
  activeId: SettingsPageId;
  hint: string;
  items: readonly SettingsPagerItem[];
  onSelect: (pageId: SettingsPageId) => void;
}>) {
  return (
    <Animated.View collapsable={false} style={{ flex: 1, minHeight: 0 }}>
      <YStack grow={1} minH={0}>
        <HorizontalSwipeSurface>
          <YStack
            display="flex"
            shrink={0}
            px="$3.5"
            py="$2.5"
            gap="$1.5"
            borderBottomWidth={1}
            borderColor="$terminalBorder"
            bg="$terminalSurface"
            $md={{ display: 'none' }}
          >
            <XStack items="center" justify="center" gap="$2" role="tablist">
              {items.map((item, index) => {
                const isActive = item.id === activeId;

                return (
                  <Button
                    key={item.id}
                    unstyled
                    minH="$3.5"
                    minW={isActive ? 132 : '$2.5'}
                    px={isActive ? '$3' : '$1.5'}
                    flexDirection="row"
                    items="center"
                    justify="center"
                    gap="$2"
                    rounded="$0"
                    borderWidth={1}
                    borderColor={isActive ? '$terminalCyanBorder' : 'transparent'}
                    bg={isActive ? '$terminalCyanSoft' : 'transparent'}
                    pressStyle={{ opacity: 0.7 }}
                    focusVisibleStyle={{ borderColor: '$terminalCyan' }}
                    onPress={() => onSelect(item.id)}
                    role="tab"
                    aria-selected={isActive}
                    aria-label={item.label}
                  >
                    {isActive ? (
                      <>
                        <MonoText size="$1" color="$terminalCyan">{String(index + 1).padStart(2, '0')}</MonoText>
                        <TerminalText size="$2.5" color="$terminalCyan" fontWeight="700" numberOfLines={1}>{item.label}</TerminalText>
                      </>
                    ) : (
                      <YStack width="$0.5" height="$0.5" bg="$terminalMuted" opacity={0.7} />
                    )}
                  </Button>
                );
              })}
            </XStack>
            <MonoText size="$1" text="center" color="$terminalMuted">{hint}</MonoText>
          </YStack>
        </HorizontalSwipeSurface>

        {children}
      </YStack>
    </Animated.View>
  );
}
