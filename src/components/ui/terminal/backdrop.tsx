import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';
import { YStack, getTokens } from 'tamagui';

import { TerminalMotionField } from '../motion/terminal-motion-field';

export function TerminalBackdrop({ tint }: { tint?: string }) {
  const colors = getTokens().color;
  const resolvedTint = tint ?? colors.terminalCyan.val;
  const [viewportSize, setViewportSize] = useState({ width: 1, height: 1 });
  const handleBackdropLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewportSize((currentSize) => currentSize.width === width && currentSize.height === height ? currentSize : { width, height });
  };
  return (
    <YStack position="absolute" t={0} b={0} l={0} r={0} overflow="hidden" bg="$terminalBg" style={{ pointerEvents: 'none' }} onLayout={handleBackdropLayout}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${viewportSize.width} ${viewportSize.height}`} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
        <Defs>
          <Pattern id="terminal-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <Rect width="1" height="40" fill={colors.terminalGrid.val} />
            <Rect width="40" height="1" fill={colors.terminalGrid.val} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#terminal-grid)" opacity="0.52" />
      </Svg>
      <TerminalMotionField
        width={viewportSize.width}
        height={viewportSize.height}
        tint={resolvedTint}
        secondaryTint={colors.terminalSuccess.val}
      />
      <Svg width="100%" height="100%" viewBox={`0 0 ${viewportSize.width} ${viewportSize.height}`} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
        <Defs>
          <Pattern id="terminal-scanlines-overlay" width="3" height="3" patternUnits="userSpaceOnUse">
            <Rect width="3" height="1" fill={colors.terminalScanline.val} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#terminal-scanlines-overlay)" opacity="0.5" />
      </Svg>
    </YStack>
  );
}
