import { BlurView } from 'expo-blur';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import type { RefObject } from 'react';
import { StyleSheet } from 'react-native';
import type { View } from 'react-native';
import { Button, XStack, YStack, getTokens } from 'tamagui';

import {
  HorizontalSwipeSurface,
  MonoText,
  SlidingSelection,
  TerminalText,
} from '@/components';
import type { HorizontalSwipeDirection } from '@/components';
import type { SettingsPageId } from '../navigation-config';

const PAGER_ITEM_HEIGHT = 22;
const PAGER_TICK_HEIGHT = 2;
const PAGER_INACTIVE_TICK_WIDTH = 18;

type SettingsPagerItem = {
  id: SettingsPageId;
  label: string;
};

export type SettingsSwipeAction =
  | { type: 'exit' }
  | { pageId: SettingsPageId; type: 'select-page' };

const styles = StyleSheet.create({
  blur: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
    pointerEvents: 'none',
  },
});

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

export function hasAdjacentSettingsPage({
  activeId,
  direction,
  items,
}: {
  activeId: SettingsPageId;
  direction: HorizontalSwipeDirection;
  items: readonly { id: SettingsPageId }[];
}) {
  return resolveSettingsSwipeAction({ activeId, direction, items })?.type === 'select-page';
}

function SettingsPagerTick() {
  return (
    <YStack width="100%" height="100%">
      <YStack
        position="absolute"
        b={0}
        l={0}
        r={0}
        height={8}
        bg="$terminalCyanSoft"
        $platform-web={{ clipPath: 'polygon(0 100%, 0 3px, 3px 0, calc(100% - 3px) 0, 100% 3px, 100% 100%)' }}
      />
      <YStack position="absolute" b={0} l={0} r={0} height={PAGER_TICK_HEIGHT} bg="$terminalCyan" />
    </YStack>
  );
}

export function SettingsPagerTabs({
  activeId,
  blurTarget,
  items,
  onSelect,
  swipeHint,
  tabListLabel,
}: {
  activeId: SettingsPageId;
  blurTarget: RefObject<View | null>;
  items: readonly SettingsPagerItem[];
  onSelect: (pageId: SettingsPageId) => void;
  swipeHint: string;
  tabListLabel: string;
}) {
  const colors = getTokens().color;
  const platformBlurProps = process.env.EXPO_OS === 'android'
    ? {
        blurMethod: 'dimezisBlurViewSdk31Plus',
        blurReductionFactor: 1,
        blurTarget,
      } as const
    : {};
  const hasPreviousStep = hasAdjacentSettingsPage({ activeId, direction: 'right', items });
  const hasNextStep = hasAdjacentSettingsPage({ activeId, direction: 'left', items });

  return (
    <HorizontalSwipeSurface>
      <YStack
        display="flex"
        shrink={0}
        position="relative"
        overflow="hidden"
        px="$3.5"
        py="$2.5"
        gap="$1.5"
        borderBottomWidth={1}
        borderColor="$terminalBorder"
        bg="transparent"
        $md={{ display: 'none' }}
      >
        <BlurView
          {...platformBlurProps}
          intensity={64}
          tint="dark"
          style={styles.blur}
        />
        <YStack
          position="absolute"
          t={0}
          b={0}
          l={0}
          r={0}
          bg="$terminalSurface"
          opacity={0.28}
          z="$0"
          style={{ pointerEvents: 'none' }}
        />

        <XStack
          position="relative"
          z="$1"
          items="center"
          justify="center"
          gap="$3"
          role="tablist"
          aria-label={tabListLabel}
        >
          <YStack opacity={hasPreviousStep ? 0.55 : 0.15} style={{ pointerEvents: 'none' }}>
            <ChevronLeft size={14} color={colors.terminalMuted.val} strokeWidth={1.5} />
          </YStack>

          <SlidingSelection value={activeId} gap={10} indicator={<SettingsPagerTick />}>
            {items.map((item) => {
              const isActive = item.id === activeId;

              return (
                <SlidingSelection.Item key={item.id} value={item.id}>
                  <Button
                    unstyled
                    height={PAGER_ITEM_HEIGHT}
                    width={isActive ? undefined : PAGER_INACTIVE_TICK_WIDTH}
                    px={isActive ? '$1.5' : 0}
                    flexDirection="row"
                    items="flex-start"
                    justify="center"
                    rounded="$0"
                    bg="transparent"
                    pressStyle={{ opacity: 0.65 }}
                    focusVisibleStyle={{ bg: '$terminalCyanSoft' }}
                    onPress={() => onSelect(item.id)}
                    role="tab"
                    aria-selected={isActive}
                    aria-label={item.label}
                  >
                    {isActive ? (
                      <TerminalText
                        size="$2.5"
                        lineHeight={18}
                        color="$terminalCyan"
                        fontWeight="700"
                        numberOfLines={1}
                      >
                        {item.label}
                      </TerminalText>
                    ) : (
                      <YStack
                        position="absolute"
                        b={0}
                        l={0}
                        r={0}
                        height={PAGER_TICK_HEIGHT}
                        bg="$terminalMuted"
                        opacity={0.45}
                      />
                    )}
                  </Button>
                </SlidingSelection.Item>
              );
            })}
          </SlidingSelection>

          <YStack opacity={hasNextStep ? 0.55 : 0.15} style={{ pointerEvents: 'none' }}>
            <ChevronRight size={14} color={colors.terminalMuted.val} strokeWidth={1.5} />
          </YStack>
        </XStack>

        <MonoText size="$1" text="center" color="$terminalMuted">
          {swipeHint}
        </MonoText>
      </YStack>
    </HorizontalSwipeSurface>
  );
}
