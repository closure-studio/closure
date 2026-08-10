import { useId } from 'react';
import {
  Defs,
  G,
  LinearGradient as SvgLinearGradient,
  Pattern,
  Rect,
  Stop,
} from 'react-native-svg';
import { getTokens } from 'tamagui';

export type AvatarFilterProps = {
  testID: string;
};

export function AvatarFilter({ testID }: AvatarFilterProps) {
  const colors = getTokens().color;
  const filterId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const scanlinePatternId = `avatar-scanlines-${filterId}`;
  const scanlineFill = `url(#${scanlinePatternId})`;
  const washFill = `url(#${scanlinePatternId}-wash)`;

  return (
    <G testID={testID}>
      <Defs>
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
      <Rect width="100%" height="100%" fill={colors.appBackground.val} opacity={0.18} />
      <Rect width="100%" height="100%" fill={colors.appAccent.val} opacity={0.08} />
      <Rect width="100%" height="100%" fill={washFill} />
      <Rect width="100%" height="100%" fill={scanlineFill} opacity={0.62} />
    </G>
  );
}
