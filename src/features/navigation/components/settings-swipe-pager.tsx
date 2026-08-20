import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Button, XStack, YStack, getTokens } from 'tamagui';

import {
  MonoText,
  SlidingSelection,
  TerminalText,
} from '@/components';
import { resolveAdjacentHorizontalSwipeItem } from '@/utils/horizontal-swipe';
import type { HorizontalSwipeDirection } from '@/utils/horizontal-swipe';
import { NavigationHeaderEdge } from './navigation-header-edge';
import type { SettingsPageId } from '../navigation-config';

const PAGER_ITEM_HEIGHT = 22;
const PAGER_TICK_HEIGHT = 2;
const PAGER_INACTIVE_TICK_WIDTH = 18;
const PAGER_ARROW_ACTIVE_OPACITY = 0.85;
const PAGER_ARROW_INACTIVE_OPACITY = 0.35;
const PAGER_ARROW_STROKE_WIDTH = 1.8;
const SWIPE_HINT_OFFSET_PX = 10;
const SWIPE_HINT_HALF_TRAVEL_DURATION_MS = 4_000;
const SWIPE_HINT_FULL_TRAVEL_DURATION_MS = 8_000;

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
  if (items[0]?.id === activeId && direction === 'right') {
    return { type: 'exit' };
  }

  const nextPage = resolveAdjacentHorizontalSwipeItem({ activeId, direction, items });
  return nextPage ? { pageId: nextPage.id, type: 'select-page' } : null;
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
        bg="$appAccentSoft"
        $platform-web={{ clipPath: 'polygon(0 100%, 0 3px, 3px 0, calc(100% - 3px) 0, 100% 3px, 100% 100%)' }}
      />
      <YStack position="absolute" b={0} l={0} r={0} height={PAGER_TICK_HEIGHT} bg="$appAccent" />
    </YStack>
  );
}

function AnimatedSwipeHint({ children }: { children: string }) {
  const reducedMotion = useReducedMotion();
  const horizontalOffset = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: horizontalOffset.get() }],
  }));

  useEffect(() => {
    cancelAnimation(horizontalOffset);
    horizontalOffset.set(0);

    if (!reducedMotion) {
      horizontalOffset.set(withRepeat(
        withSequence(
          withTiming(SWIPE_HINT_OFFSET_PX, {
            duration: SWIPE_HINT_HALF_TRAVEL_DURATION_MS,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(-SWIPE_HINT_OFFSET_PX, {
            duration: SWIPE_HINT_FULL_TRAVEL_DURATION_MS,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: SWIPE_HINT_HALF_TRAVEL_DURATION_MS,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      ));
    }

    return () => cancelAnimation(horizontalOffset);
  }, [horizontalOffset, reducedMotion]);

  return (
    <XStack justify="center" overflow="hidden">
      <Animated.View testID="settings-swipe-hint" style={animatedStyle}>
        <MonoText size="$1" text="center" color="$appMuted">
          {children}
        </MonoText>
      </Animated.View>
    </XStack>
  );
}

export function SettingsPagerTabs({
  activeId,
  items,
  onSelect,
  swipeHint,
  tabListLabel,
}: {
  activeId: SettingsPageId;
  items: readonly SettingsPagerItem[];
  onSelect: (pageId: SettingsPageId) => void;
  swipeHint: string;
  tabListLabel: string;
}) {
  const colors = getTokens().color;
  const hasPreviousStep = resolveSettingsSwipeAction({ activeId, direction: 'right', items })?.type === 'select-page';
  const hasNextStep = resolveSettingsSwipeAction({ activeId, direction: 'left', items })?.type === 'select-page';

  return (
    <YStack
        display="flex"
        shrink={0}
        position="relative"
        overflow="hidden"
        px="$3.5"
        py="$2.5"
        borderBottomWidth={1}
        borderColor="$appBorder"
        bg="transparent"
        $md={{ display: 'none' }}
      >
        <NavigationHeaderEdge />

        <XStack
          testID="settings-pager-layout"
          position="relative"
          z="$1"
          items="center"
          justify="center"
          gap="$3"
        >
          <YStack
            testID="settings-previous-icon"
            height={PAGER_ITEM_HEIGHT}
            items="center"
            justify="center"
            opacity={hasPreviousStep ? PAGER_ARROW_ACTIVE_OPACITY : PAGER_ARROW_INACTIVE_OPACITY}
            style={{ pointerEvents: 'none' }}
          >
            <ChevronLeft size={14} color={colors.appAccent.val} strokeWidth={PAGER_ARROW_STROKE_WIDTH} />
          </YStack>

          <YStack testID="settings-pager-content" gap="$1.5">
            <XStack items="center" justify="center" role="tablist" aria-label={tabListLabel}>
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
                        focusVisibleStyle={{ bg: '$appAccentSoft' }}
                        onPress={() => onSelect(item.id)}
                        role="tab"
                        aria-selected={isActive}
                        aria-label={item.label}
                      >
                        {isActive ? (
                          <TerminalText
                            size="$2.5"
                            lineHeight={18}
                            color="$appAccent"
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
                            bg="$appMuted"
                            opacity={0.45}
                          />
                        )}
                      </Button>
                    </SlidingSelection.Item>
                  );
                })}
              </SlidingSelection>
            </XStack>

            <AnimatedSwipeHint>{swipeHint}</AnimatedSwipeHint>
          </YStack>

          <YStack
            testID="settings-next-icon"
            height={PAGER_ITEM_HEIGHT}
            items="center"
            justify="center"
            opacity={hasNextStep ? PAGER_ARROW_ACTIVE_OPACITY : PAGER_ARROW_INACTIVE_OPACITY}
            style={{ pointerEvents: 'none' }}
          >
            <ChevronRight size={14} color={colors.appAccent.val} strokeWidth={PAGER_ARROW_STROKE_WIDTH} />
          </YStack>
        </XStack>
      </YStack>
  );
}
