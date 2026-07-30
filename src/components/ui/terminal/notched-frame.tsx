import type { PropsWithChildren } from 'react';
import { useId } from 'react';
import Svg, { ClipPath, Defs, G, Path, Polygon, Rect } from 'react-native-svg';
import { YStack } from 'tamagui';

export function NotchedFrame({
  size,
  notch = 8,
  stroke,
  fill,
  bracketColor,
  children,
  ...props
}: PropsWithChildren<{
  size: number;
  notch?: number;
  stroke?: string;
  fill?: string;
  bracketColor?: string;
} & React.ComponentProps<typeof YStack>>) {
  const clipId = `notch-${useId().replace(/:/g, '')}`;
  const notchSize = notch;
  const bracketSize = 12;
  const points = `0,0 ${size - notchSize},0 ${size},${notchSize} ${size},${size} ${notchSize},${size} 0,${size - notchSize}`;

  return (
    <YStack position="relative" width={size} height={size} items="center" justify="center" {...props}>
      <Svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        <Defs>
          <ClipPath id={clipId}>
            <Polygon points={points} />
          </ClipPath>
        </Defs>
        {fill ? <Polygon points={points} fill={fill} /> : null}
        <G clipPath={`url(#${clipId})`}>
          {stroke ? <Rect transform={[{ translateX: 0.5 }, { translateY: 0.5 }]} width={size - 1} height={size - 1} fill="none" stroke={stroke} strokeWidth={1} /> : null}
          {bracketColor ? (
            <>
              <Path d={`M0.5,${bracketSize} L0.5,0.5 L${bracketSize},0.5`} fill="none" stroke={bracketColor} strokeWidth={1} />
              <Path d={`M${size - bracketSize},0.5 L${size - 0.5},0.5 L${size - 0.5},${bracketSize}`} fill="none" stroke={bracketColor} strokeWidth={1} />
              <Path d={`M0.5,${size - bracketSize} L0.5,${size - 0.5} L${bracketSize},${size - 0.5}`} fill="none" stroke={bracketColor} strokeWidth={1} />
              <Path d={`M${size - bracketSize},${size - 0.5} L${size - 0.5},${size - 0.5} L${size - 0.5},${size - bracketSize}`} fill="none" stroke={bracketColor} strokeWidth={1} />
            </>
          ) : null}
        </G>
      </Svg>
      {children}
    </YStack>
  );
}
