import { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Image as SvgImage,
  LinearGradient as SvgLinearGradient,
  Mask,
  Pattern,
  RadialGradient as SvgRadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { YStack, getTokens } from 'tamagui';

import profileAvatarFallback from '@/assets/images/profile-avatar.webp';

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
  const colors = getTokens().color;
  const avatarId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const maskGradientId = `avatar-mask-gradient-${avatarId}`;
  const maskId = `avatar-mask-${avatarId}`;
  const scanlinePatternId = `avatar-scanlines-${avatarId}`;
  const normalizedSource = source?.trim() ?? '';
  const maskFill = `url(#${maskGradientId})`;
  const scanlineFill = `url(#${scanlinePatternId})`;
  const washFill = `url(#${scanlinePatternId}-wash)`;

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
        <Svg
          testID="avatar-svg"
          width="100%"
          height="100%"
          viewBox={`0 0 ${size} ${size}`}
          preserveAspectRatio="none"
          style={styles.avatarGraphic}
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
            <Mask
              testID="avatar-mask"
              id={maskId}
              width={size}
              height={size}
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
            >
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={size / 2}
                fill={maskFill}
              />
            </Mask>
            <Pattern id={scanlinePatternId} width="3" height="3" patternUnits="userSpaceOnUse">
              <Rect width="3" height="1" fill={colors.appScanline.val} />
            </Pattern>
            <SvgLinearGradient
              id={`${scanlinePatternId}-wash`}
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <Stop offset="0%" stopColor={colors.appAccent.val} stopOpacity={0.14} />
              <Stop offset="52%" stopColor={colors.appAccent.val} stopOpacity={0} />
              <Stop offset="100%" stopColor={colors.appText.val} stopOpacity={0.08} />
            </SvgLinearGradient>
          </Defs>
          <G mask={`url(#${maskId})`}>
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
            <Rect width="100%" height="100%" fill={colors.appBackground.val} opacity={0.18} />
            <Rect width="100%" height="100%" fill={colors.appAccent.val} opacity={0.08} />
            <Rect width="100%" height="100%" fill={washFill} />
            <Rect width="100%" height="100%" fill={scanlineFill} opacity={0.62} />
          </G>
        </Svg>
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
