import { BlurView } from 'expo-blur';
import { Settings } from 'lucide-react-native';
import type { RefObject } from 'react';
import { StyleSheet } from 'react-native';
import type { View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from 'react-native-svg';
import { Button, XStack, YStack, getTokens } from 'tamagui';

import { TerminalText } from '@/components';

type NavigationHeaderProps = {
  avatarInitial: string;
  avatarLabel: string;
  blurTarget: RefObject<View | null>;
  isSettingsActive: boolean;
  onSettingsPress: () => void;
  settingsLabel: string;
  title: string;
};

type ProfileAvatarProps = Pick<NavigationHeaderProps, 'avatarInitial' | 'avatarLabel'>;

const styles = StyleSheet.create({
  blur: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,
  },
  fadingEdge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: 5,
    zIndex: 0,
  },
});

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
  blurTarget,
  isSettingsActive,
  onSettingsPress,
  settingsLabel,
  title,
}: NavigationHeaderProps) {
  const colors = getTokens().color;
  const platformBlurProps = process.env.EXPO_OS === 'android'
    ? {
        blurMethod: 'dimezisBlurViewSdk31Plus',
        blurReductionFactor: 1,
        blurTarget,
      } as const
    : {};

  return (
    <YStack
      position="relative"
      overflow="hidden"
      bg="transparent"
    >
      <BlurView
        {...platformBlurProps}
        intensity={80}
        tint="dark"
        pointerEvents="none"
        style={styles.blur}
      />
      <YStack
        position="absolute"
        t={0}
        b={0}
        l={0}
        r={0}
        bg="$terminalSurface"
        opacity={0.18}
        z="$0"
        pointerEvents="none"
      />
      <YStack
        position="absolute"
        t={0}
        l={0}
        r={0}
        height={1}
        bg="$terminalText"
        opacity={0.5}
        z="$0"
        pointerEvents="none"
      />
      <Svg
        width="100%"
        height={5}
        pointerEvents="none"
        style={styles.fadingEdge}
      >
        <Defs>
          <SvgLinearGradient id="navigation-header-edge" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.terminalCyan.val} stopOpacity={0} />
            <Stop offset="20%" stopColor={colors.terminalCyan.val} stopOpacity={0.08} />
            <Stop offset="50%" stopColor={colors.terminalCyan.val} stopOpacity={0.72} />
            <Stop offset="80%" stopColor={colors.terminalCyan.val} stopOpacity={0.08} />
            <Stop offset="100%" stopColor={colors.terminalCyan.val} stopOpacity={0} />
          </SvgLinearGradient>
        </Defs>
        <Rect width="100%" height={5} fill="url(#navigation-header-edge)" opacity={0.12} />
        <Rect width="100%" height={1} fill="url(#navigation-header-edge)" transform="translate(0 4)" />
      </Svg>

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
