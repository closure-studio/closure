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

import {
  AVATAR_FILTER_BASE_LAYERS,
  AVATAR_FILTER_PATTERN,
  AVATAR_FILTER_SCANLINE_OPACITY,
  AVATAR_FILTER_WASH_STOPS,
} from './avatar-filter-config';

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
        <Pattern
          id={scanlinePatternId}
          width={AVATAR_FILTER_PATTERN.width}
          height={AVATAR_FILTER_PATTERN.height}
          patternUnits="userSpaceOnUse"
        >
          <Rect
            width={AVATAR_FILTER_PATTERN.width}
            height={AVATAR_FILTER_PATTERN.rowHeight}
            fill={colors.appScanline.val}
          />
        </Pattern>
        <SvgLinearGradient
          id={`${scanlinePatternId}-wash`}
          x1="0%"
          y1="100%"
          x2="100%"
          y2="0%"
        >
          {AVATAR_FILTER_WASH_STOPS.map((stop) => (
            <Stop
              key={`${stop.color}-${stop.offset}`}
              offset={`${stop.offset * 100}%`}
              stopColor={colors[stop.color].val}
              stopOpacity={stop.opacity}
            />
          ))}
        </SvgLinearGradient>
      </Defs>
      {AVATAR_FILTER_BASE_LAYERS.map((layer) => (
        <Rect
          key={`${layer.color}-${layer.opacity}`}
          width="100%"
          height="100%"
          fill={colors[layer.color].val}
          opacity={layer.opacity}
        />
      ))}
      <Rect width="100%" height="100%" fill={washFill} />
      <Rect
        width="100%"
        height="100%"
        fill={scanlineFill}
        opacity={AVATAR_FILTER_SCANLINE_OPACITY}
      />
    </G>
  );
}
