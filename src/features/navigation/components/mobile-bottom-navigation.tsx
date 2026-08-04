import type { LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, XStack, YStack, getTokens } from 'tamagui';

import { MonoText } from '@/components';

type MobileBottomNavigationItem = {
  icon: LucideIcon;
  id: string;
  label: string;
};

export function MobileBottomNavigation({
  activeId,
  items,
  onSelect,
  reducedMotion,
}: {
  activeId: string;
  items: readonly MobileBottomNavigationItem[];
  onSelect: (itemId: string) => void;
  reducedMotion: boolean;
}) {
  const colors = getTokens().color;
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [navigationWidth, setNavigationWidth] = useState(0);
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));
  const buttonWidth = items.length > 0 ? Math.max(0, (navigationWidth - 16) / items.length) : 0;
  const indicatorWidth = Math.max(0, buttonWidth - 16);
  const indicatorLeft = 16 + activeIndex * buttonWidth;

  const handleLayout = (event: LayoutChangeEvent) => {
    setNavigationWidth(event.nativeEvent.layout.width);
  };

  return (
    <YStack
      testID="mobile-bottom-navigation"
      display="flex"
      height={66 + bottomInset}
      shrink={0}
      position="relative"
      overflow="hidden"
      borderTopWidth={1}
      borderColor="$terminalBorder"
      bg="$terminalBg"
      onLayout={handleLayout}
      $md={{ display: 'none' }}
    >
      <XStack
        position="absolute"
        t={0}
        l={0}
        r={0}
        height={66}
        px="$2"
        py={6}
      >
        <YStack
          transition={reducedMotion ? '0ms' : 'quickLessBouncy'}
          position="absolute"
          t={6}
          l={indicatorLeft}
          width={indicatorWidth}
          height={2}
          bg="$terminalCyan"
          opacity={navigationWidth > 0 ? 1 : 0}
        />
        {items.map((item) => {
          const isActive = item.id === activeId;
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              unstyled
              grow={1}
              minW={0}
              py="$2"
              items="center"
              gap="$1"
              hoverStyle={{ bg: '$terminalCyanSoft' }}
              pressStyle={{ opacity: 0.7 }}
              onPress={() => onSelect(item.id)}
              role="tab"
              aria-selected={isActive}
            >
              <Icon
                size={19}
                color={isActive ? colors.terminalCyan.val : colors.terminalMuted.val}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <MonoText
                size="$1"
                color={isActive ? '$terminalCyan' : '$terminalMuted'}
                numberOfLines={1}
              >
                {item.label}
              </MonoText>
            </Button>
          );
        })}
      </XStack>
    </YStack>
  );
}
