import { useId, useState } from 'react';
import type { ComponentProps, PropsWithChildren } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, Path, Polygon } from 'react-native-svg';
import { Button, YStack, getTokens } from 'tamagui';

const DEFAULT_NOTCH_SIZE = 12;
const NOTCHED_BRACKET_SIZE = 12;
const NOTCHED_STROKE_INSET = 0.5;
const NOTCHED_STROKE_WIDTH = 1;

type NotchedSurfaceProps = {
  fill: string;
  fillOpacity?: number;
  notch?: number;
  bracketColor?: string;
  stroke: string;
  strokeDasharray?: string;
};

export function NotchedSurface({
  fill,
  fillOpacity = 1,
  notch = DEFAULT_NOTCH_SIZE,
  bracketColor,
  stroke,
  strokeDasharray,
}: NotchedSurfaceProps) {
  const clipId = `notched-surface-${useId().replace(/:/g, '')}`;
  const [layout, setLayout] = useState({ height: 0, width: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setLayout((currentLayout) => (
      currentLayout.height === height && currentLayout.width === width
        ? currentLayout
        : { height, width }
    ));
  };

  const { height, width } = layout;
  const fillPoints = `0,0 ${width - notch},0 ${width},${notch} ${width},${height} ${notch},${height} 0,${height - notch}`;
  const strokePath = [
    `M${NOTCHED_STROKE_INSET},${NOTCHED_STROKE_INSET} H${width - notch - NOTCHED_STROKE_INSET}`,
    `M${width - NOTCHED_STROKE_INSET},${notch + NOTCHED_STROKE_INSET} V${height - NOTCHED_STROKE_INSET}`,
    `M${width - NOTCHED_STROKE_INSET},${height - NOTCHED_STROKE_INSET} H${notch + NOTCHED_STROKE_INSET}`,
    `M${NOTCHED_STROKE_INSET},${height - notch - NOTCHED_STROKE_INSET} V${NOTCHED_STROKE_INSET}`,
  ].join(' ');
  const bracketPath = [
    `M${NOTCHED_STROKE_INSET},${NOTCHED_BRACKET_SIZE} V${NOTCHED_STROKE_INSET} H${NOTCHED_BRACKET_SIZE}`,
    `M${width - NOTCHED_BRACKET_SIZE},${NOTCHED_STROKE_INSET} H${width - NOTCHED_STROKE_INSET} V${NOTCHED_BRACKET_SIZE}`,
    `M${NOTCHED_STROKE_INSET},${height - NOTCHED_BRACKET_SIZE} V${height - NOTCHED_STROKE_INSET} H${NOTCHED_BRACKET_SIZE}`,
    `M${width - NOTCHED_BRACKET_SIZE},${height - NOTCHED_STROKE_INSET} H${width - NOTCHED_STROKE_INSET} V${height - NOTCHED_BRACKET_SIZE}`,
  ].join(' ');

  return (
    <YStack
      position="absolute"
      t={0}
      b={0}
      l={0}
      r={0}
      z={0}
      style={{ pointerEvents: 'none' }}
      onLayout={handleLayout}
    >
      {width > 0 && height > 0 ? (
        <Svg width={width} height={height} style={{ pointerEvents: 'none' }}>
          <Defs>
            <ClipPath id={clipId}>
              <Polygon points={fillPoints} />
            </ClipPath>
          </Defs>
          <Polygon points={fillPoints} fill={fill} fillOpacity={fillOpacity} />
          <Path
            d={strokePath}
            fill="none"
            stroke={stroke}
            strokeWidth={NOTCHED_STROKE_WIDTH}
            {...(strokeDasharray ? { strokeDasharray } : {})}
          />
          {bracketColor ? (
            <G clipPath={`url(#${clipId})`}>
              <Path
                d={bracketPath}
                fill="none"
                stroke={bracketColor}
                strokeWidth={NOTCHED_STROKE_WIDTH}
              />
            </G>
          ) : null}
        </Svg>
      ) : null}
    </YStack>
  );
}

type NotchedButtonProps = PropsWithChildren<{
  isSelected?: boolean;
} & Omit<ComponentProps<typeof Button>, 'children'>>;

export function NotchedButton({
  children,
  isSelected,
  ...props
}: NotchedButtonProps) {
  const colors = getTokens().color;
  const reducedMotion = useReducedMotion();

  return (
    <Button
      unstyled
      shrink={0}
      position="relative"
      rounded="$0"
      bg="transparent"
      scale={isSelected === false ? 0.985 : 1}
      transition={reducedMotion ? '0ms' : 'quickLessBouncy'}
      hoverStyle={{ opacity: 0.9 }}
      pressStyle={{ opacity: 0.72, scale: 0.97 }}
      focusVisibleStyle={{ outlineColor: '$appAccent', outlineStyle: 'solid', outlineWidth: 1 }}
      {...props}
    >
      <NotchedSurface
        fill={colors.appSurfaceRaised.val}
        stroke={isSelected ? colors.appAccentBorder.val : colors.appBorder.val}
      />
      {children}
    </Button>
  );
}

export function NotchedSelectionIndicator() {
  const colors = getTokens().color;

  return (
    <YStack position="relative" width="100%" height="100%">
      <NotchedSurface
        fill={colors.appAccentSoft.val}
        fillOpacity={0.5}
        stroke={colors.appAccentBorder.val}
      />
    </YStack>
  );
}
