import { useId, useState } from 'react';
import Svg, {
  Circle,
  Defs,
  G,
  Image as SvgImage,
  Mask,
  RadialGradient as SvgRadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { getTokens } from 'tamagui';

import { AvatarFilter } from '@/components';
import { getItemImageUrl } from '../item-image';

const CIRCULAR_ARTWORK_RADIUS = 999;
const ARTWORK_FEATHER_STOPS = [
  { offset: '0%', opacity: 1, color: '#ffffff' },
  { offset: '58%', opacity: 1, color: '#ffffff' },
  { offset: '70%', opacity: 0.95, color: '#ffffff' },
  { offset: '82%', opacity: 0.7, color: '#ffffff' },
  { offset: '93%', opacity: 0.3, color: '#ffffff' },
  { offset: '100%', opacity: 0, color: '#000000' },
] as const;
function getFirstCharacter(value: string): string {
  return Array.from(value)[0] ?? '';
}

/**
 * Full-detail SVG artwork (radial feather, mask, scanline filter) for the
 * single selected-item preview. Grid cells must use the lightweight
 * {@link InventoryGridThumbnail} instead — never render this per cell.
 */
export function InventoryPreviewArtwork({
  fallbackSize,
  height,
  icon,
  itemId,
  label,
  testIdPrefix,
  width,
}: {
  fallbackSize: number;
  height: number;
  icon: string;
  itemId: string;
  label: string;
  testIdPrefix: string;
  width: number;
}) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'ready'>('loading');
  const colors = getTokens().color;
  const artworkId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const maskGradientId = `inventory-artwork-mask-gradient-${artworkId}`;
  const maskId = `inventory-artwork-mask-${artworkId}`;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2;
  const featherInset = Math.min(width, height) / 10;
  const viewBoxWidth = width + featherInset * 2;
  const viewBoxHeight = height + featherInset * 2;
  const showFallback = imageStatus !== 'ready';

  return (
    <Svg
      testID={`${testIdPrefix}-circle-${itemId}`}
      width={width}
      height={height}
      viewBox={`${-featherInset} ${-featherInset} ${viewBoxWidth} ${viewBoxHeight}`}
      preserveAspectRatio="none"
      style={{ borderRadius: CIRCULAR_ARTWORK_RADIUS, overflow: 'hidden' }}
    >
      <G testID={`${testIdPrefix}-feather-${itemId}`}>
        <Defs>
          <SvgRadialGradient id={maskGradientId} cx="50%" cy="50%" r="50%">
            {ARTWORK_FEATHER_STOPS.map((stop) => (
              <Stop
                key={stop.offset}
                offset={stop.offset}
                stopColor={stop.color}
                stopOpacity={stop.opacity}
              />
            ))}
          </SvgRadialGradient>
          <Mask
            testID={`${testIdPrefix}-feather-mask-${itemId}`}
            id={maskId}
            width="100%"
            height="100%"
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
          >
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill={`url(#${maskGradientId})`}
            />
          </Mask>
        </Defs>
        <G mask={`url(#${maskId})`}>
          {showFallback ? (
            <G testID={`${testIdPrefix}-fallback-${itemId}`} aria-hidden>
              <SvgText
                testID={`${testIdPrefix}-fallback-character-${itemId}`}
                transform={`translate(${centerX} ${centerY})`}
                dy={fallbackSize * 0.35}
                fill={colors.appMuted.val}
                fontSize={fallbackSize}
                fontWeight="800"
                textAnchor="middle"
              >
                {getFirstCharacter(label)}
              </SvgText>
            </G>
          ) : null}
          <SvgImage
            testID={`${testIdPrefix}-svg-image-${itemId}`}
            href={getItemImageUrl(icon)}
            width={width}
            height={height}
            preserveAspectRatio="xMidYMid meet"
            onLoad={() => setImageStatus('ready')}
            accessibilityLabel={label}
          />
          <G testID={`${testIdPrefix}-filter-${itemId}`} aria-hidden>
            <AvatarFilter testID={`${testIdPrefix}-filter-svg-${itemId}`} />
          </G>
        </G>
      </G>
    </Svg>
  );
}
