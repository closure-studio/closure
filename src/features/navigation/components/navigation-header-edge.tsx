import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from 'react-native-svg';
import { getTokens } from 'tamagui';

const NAVIGATION_HEADER_EDGE_GRADIENT_ID = 'navigation-header-edge';

const styles = StyleSheet.create({
  edge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: 5,
    zIndex: 0,
    pointerEvents: 'none',
  },
});

export function NavigationHeaderEdge() {
  const colors = getTokens().color;
  const gradientFill = `url(#${NAVIGATION_HEADER_EDGE_GRADIENT_ID})`;

  return (
    <Svg width="100%" height={5} style={styles.edge}>
      <Defs>
        <SvgLinearGradient
          id={NAVIGATION_HEADER_EDGE_GRADIENT_ID}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <Stop offset="0%" stopColor={colors.terminalCyan.val} stopOpacity={0} />
          <Stop offset="20%" stopColor={colors.terminalCyan.val} stopOpacity={0.08} />
          <Stop offset="50%" stopColor={colors.terminalCyan.val} stopOpacity={0.72} />
          <Stop offset="80%" stopColor={colors.terminalCyan.val} stopOpacity={0.08} />
          <Stop offset="100%" stopColor={colors.terminalCyan.val} stopOpacity={0} />
        </SvgLinearGradient>
      </Defs>
      <Rect width="100%" height={5} fill={gradientFill} opacity={0.12} />
      <Rect width="100%" height={1} fill={gradientFill} transform="translate(0 4)" />
    </Svg>
  );
}
