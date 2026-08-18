import { MaskedView } from '@expo/ui/community/masked-view';
import { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Image as SvgImage,
  RadialGradient as SvgRadialGradient,
  Stop,
} from 'react-native-svg';
import { YStack } from 'tamagui';

import profileAvatarFallback from '@/assets/images/profile-avatar.webp';
import { AvatarFilter } from './avatar-filter';

const DEFAULT_AVATAR_SIZE = 52;

export type AvatarProps = {
  accessibilityLabel: string;
  size?: number;
  source?: string | null | undefined;
};

export function Avatar({
  accessibilityLabel,
  size = DEFAULT_AVATAR_SIZE,
  source,
}: AvatarProps) {
  const avatarId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const maskGradientId = `avatar-mask-gradient-${avatarId}`;
  const normalizedSource = source?.trim() ?? '';

  return (
    <YStack
      testID="avatar"
      position="relative"
      width={size}
      height={size}
      shrink={0}
      items="center"
      justify="center"
      aria-label={accessibilityLabel}
    >
      <YStack
        testID="avatar-frame"
        position="absolute"
        t={0}
        b={0}
        l={0}
        r={0}
        overflow="hidden"
        bg="transparent"
        rounded="$10"
      >
        <MaskedView
          testID="avatar-mask"
          style={StyleSheet.absoluteFill}
          maskElement={
            <Svg
              testID="avatar-mask-svg"
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              preserveAspectRatio="none"
              style={StyleSheet.absoluteFill}
            >
              <Defs>
                <SvgRadialGradient id={maskGradientId} cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
                  <Stop offset="54%" stopColor="#ffffff" stopOpacity={1} />
                  <Stop offset="68%" stopColor="#ffffff" stopOpacity={0.92} />
                  <Stop offset="80%" stopColor="#ffffff" stopOpacity={0.62} />
                  <Stop offset="90%" stopColor="#ffffff" stopOpacity={0.28} />
                  <Stop offset="97%" stopColor="#ffffff" stopOpacity={0.06} />
                  <Stop offset="100%" stopColor="#000000" stopOpacity={0} />
                </SvgRadialGradient>
              </Defs>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={size / 2}
                fill={`url(#${maskGradientId})`}
              />
            </Svg>
          }
        >
          <Svg
            testID="avatar-svg"
            width="100%"
            height="100%"
            viewBox={`0 0 ${size} ${size}`}
            preserveAspectRatio="none"
            style={styles.avatarGraphic}
          >
            <SvgImage
              testID="avatar-fallback-image"
              href={profileAvatarFallback}
              width={size}
              height={size}
              preserveAspectRatio="xMidYMid slice"
            />
            {normalizedSource ? (
              <SvgImage
                testID="avatar-source-image"
                href={normalizedSource}
                width={size}
                height={size}
                preserveAspectRatio="xMidYMid slice"
              />
            ) : null}
            <AvatarFilter testID="avatar-filter" />
          </Svg>
        </MaskedView>
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  avatarGraphic: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    pointerEvents: 'none',
  },
});
