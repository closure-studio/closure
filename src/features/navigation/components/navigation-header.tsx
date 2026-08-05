import { Settings } from 'lucide-react-native';
import { Button, XStack, YStack, getTokens } from 'tamagui';

import { TerminalText } from '@/components';
import { NavigationHeaderEdge } from './navigation-header-edge';

type NavigationHeaderProps = {
  avatarInitial: string;
  avatarLabel: string;
  isSettingsActive: boolean;
  onSettingsPress: () => void;
  settingsLabel: string;
  title: string;
};

type ProfileAvatarProps = Pick<NavigationHeaderProps, 'avatarInitial' | 'avatarLabel'>;

function ProfileAvatar({ avatarInitial, avatarLabel }: ProfileAvatarProps) {
  return (
    <YStack
      width="$3.5"
      height="$3.5"
      shrink={0}
      items="center"
      justify="center"
      rounded="$10"
      borderWidth={1}
      borderColor="$terminalCyanBorder"
      bg="$terminalCyanSoft"
      aria-label={avatarLabel}
    >
      <TerminalText size="$3" color="$terminalCyan" fontWeight="800">{avatarInitial}</TerminalText>
      <YStack
        position="absolute"
        r={-1}
        b={-1}
        width={8}
        height={8}
        rounded="$10"
        borderWidth={2}
        borderColor="$terminalSurfaceStrong"
        bg="$terminalSuccess"
      />
    </YStack>
  );
}

export function NavigationHeader({
  avatarInitial,
  avatarLabel,
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

      <XStack position="relative" z="$1" minH="$6" px="$3.5" items="center" gap="$2" $md={{ display: 'none' }}>
        <ProfileAvatar avatarInitial={avatarInitial} avatarLabel={avatarLabel} />

        <YStack grow={1} minW={0} items="center" justify="center">
          <TerminalText size="$4" fontWeight="700" numberOfLines={1}>{title}</TerminalText>
        </YStack>

        <Button
          unstyled
          width="$3.5"
          height="$3.5"
          shrink={0}
          items="center"
          justify="center"
          rounded="$10"
          bg={isSettingsActive ? '$terminalCyanSoft' : 'transparent'}
          hoverStyle={{ bg: '$terminalCyanSoft' }}
          pressStyle={{ opacity: 0.65, scale: 0.94 }}
          onPress={onSettingsPress}
          aria-label={settingsLabel}
          aria-pressed={isSettingsActive}
        >
          <Settings
            size={20}
            color={isSettingsActive ? colors.terminalCyan.val : colors.terminalText.val}
            strokeWidth={1.8}
          />
        </Button>
      </XStack>

      <XStack position="relative" z="$1" display="none" minH="$6" px="$5" items="center" justify="space-between" gap="$4" $md={{ display: 'flex' }}>
        <TerminalText size="$4" fontWeight="700" numberOfLines={1}>{title}</TerminalText>
        <ProfileAvatar avatarInitial={avatarInitial} avatarLabel={avatarLabel} />
      </XStack>
    </YStack>
  );
}
