import { Settings } from 'lucide-react-native';
import { Button, XStack, YStack, getTokens } from 'tamagui';

import { Avatar, TerminalText } from '@/components';
import { NavigationHeaderEdge } from './navigation-header-edge';

type NavigationHeaderProps = {
  avatarLabel: string;
  avatarUrl?: string | null | undefined;
  isSettingsActive: boolean;
  onSettingsPress: () => void;
  settingsLabel: string;
  title: string;
};

export function NavigationHeader({
  avatarLabel,
  avatarUrl,
  isSettingsActive,
  onSettingsPress,
  settingsLabel,
  title,
}: NavigationHeaderProps) {
  const colors = getTokens().color;

  return (
    <YStack
      testID="navigation-header"
      position="relative"
      overflow="hidden"
      bg="transparent"
    >
      <NavigationHeaderEdge />

      <XStack
        position="relative"
        z="$1"
        minH="$6"
        px="$3.5"
        items="center"
        flexDirection="row-reverse"
        gap="$2"
        $large={{ flexDirection: 'row', px: '$5', gap: '$4' }}
      >
        <Button
          unstyled
          width="$3.5"
          height="$3.5"
          shrink={0}
          items="center"
          justify="center"
          rounded="$10"
          bg={isSettingsActive ? '$appAccentSoft' : 'transparent'}
          hoverStyle={{ bg: '$appAccentSoft' }}
          pressStyle={{ opacity: 0.65, scale: 0.94 }}
          onPress={onSettingsPress}
          aria-label={settingsLabel}
          aria-pressed={isSettingsActive}
          $large={{ display: 'none' }}
        >
          <Settings
            size={24}
            color={isSettingsActive ? colors.appAccent.val : colors.appText.val}
            strokeWidth={1.8}
          />
        </Button>

        <YStack grow={1} minW={0} items="center" justify="center" $large={{ items: 'flex-start' }}>
          <TerminalText size="$4" fontWeight="700" numberOfLines={1}>{title}</TerminalText>
        </YStack>

        <Avatar accessibilityLabel={avatarLabel} source={avatarUrl} />
      </XStack>
    </YStack>
  );
}
