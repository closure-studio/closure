import { useEffect, useId } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, G, LinearGradient, Path, Rect, Stop, Text } from 'react-native-svg';
import { getTokens } from 'tamagui';

// The artwork and radio hit areas share this coordinate system.
export const BASE_VIEWBOX = { width: 1000, height: 430 };
export function baseRoomBounds(index: number) {
  const row = Math.floor(index / 3);
  return { x: (row === 1 ? 10 : 150) + (index % 3) * 280, y: 5 + row * 140, width: 280, height: 140 };
}

const ROOM_MOTIFS = {
  POWER: 'M165 63A67 67 0 1 1 31 63A67 67 0 1 1 165 63ZM157 63A59 59 0 1 1 39 63A59 59 0 1 1 157 63ZM84 40H110L124 63L110 86H84L70 63ZM84 40L70 16M110 40L124 16M124 63H152M110 86L124 110M84 86L70 110M70 63H42M42 35L57 40L70 16M42 91L57 86L70 110',
  MANUFACTURE: 'M50 3H99L160 40V112L124 132H71V116H117L151 97V45L96 13H50ZM68 79L87 68L106 79V101L87 112L68 101ZM68 79L87 90L106 79M87 90V112M225 72L244 91M252 99L270 118M225 118L244 99M252 91L270 72',
  TRADING: 'M67 55L112 29L154 52V107L110 129L67 106ZM67 55L110 79L154 52M110 79V129M76 60V111M86 66V115M97 72V120M127 88V112M135 83V106M144 79V101M201 32L224 55M234 65L258 89M201 89L224 65M234 55L258 32',
};
export type BaseRoomType = keyof typeof ROOM_MOTIFS;
export type BaseArtworkLabels = {
  roomTypes: Record<BaseRoomType, string>;
  roomStatuses: Record<BaseRoomType, string>;
};

const PANEL = 'M43 10H99L104 15H197L202 10H265L270 15V63L267 67V74L270 78V123L265 128H43L39 124V78L42 74V67L39 63V15Z';
const STRIPE = 'M13 10H32L35 13V63L32 67V74L35 78V125L32 128H13L10 125V78L13 74V67L10 63V13Z';
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

type WorkStepProps = {
  progress: SharedValue<number>;
  step: number;
  count: number;
  roomOpacity: number;
};

function WorkPath({ progress, step, count, roomOpacity, d, transform }: WorkStepProps & {
  d: string;
  transform: string;
}) {
  const animatedProps = useAnimatedProps(() => ({
    opacity: roomOpacity * (progress.value >= step / count ? 1 : 0),
  }));
  return <AnimatedPath animatedProps={animatedProps} d={d} transform={transform} />;
}

function WorkRect({ progress, step, count, roomOpacity, baseOpacity, dimOpacity = 0, fill, transform }: WorkStepProps & {
  baseOpacity: number;
  dimOpacity?: number;
  fill: string;
  transform: string;
}) {
  const animatedProps = useAnimatedProps(() => ({
    opacity: roomOpacity * baseOpacity * (progress.value >= step / count ? 1 : dimOpacity),
  }));
  return <AnimatedRect animatedProps={animatedProps} transform={transform} width={39} height={6} fill={fill} />;
}

export function BaseBlueprintArtwork({ selectedIndex, roomTypes, labels }: {
  selectedIndex: number;
  roomTypes: readonly BaseRoomType[];
  labels?: BaseArtworkLabels;
}) {
  const id = useId().replace(/:/g, '');
  const colors = getTokens().color;
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(1);
  const animate = labels !== undefined && !reducedMotion;

  useEffect(() => {
    progress.set(animate ? 0 : 1);
    if (animate) {
      progress.set(withRepeat(withTiming(1, { duration: 5000, easing: Easing.linear }), -1, false));
    }
    return () => cancelAnimation(progress);
  }, [animate, progress]);

  const accents = { POWER: colors.appMaterial.val, MANUFACTURE: colors.appWarning.val, TRADING: colors.appAccent.val };
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${BASE_VIEWBOX.width} ${BASE_VIEWBOX.height}`} aria-hidden style={{ pointerEvents: 'none' }}>
      <Defs>
        <LinearGradient id={`${id}-panel`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.appSurfaceRaised.val} />
          <Stop offset="1" stopColor={colors.appBackground.val} />
        </LinearGradient>
        <ClipPath id={`${id}-clip`}><Path d={PANEL} /></ClipPath>
      </Defs>
      <G stroke={colors.appGrid.val} fill="none" strokeDasharray="2 2">
        {Array.from({ length: 12 }, (_, index) => <Path key={index} d={`M${10 + index * 93.33} 0V430`} />)}
        {[5, 145, 285, 425].map(y => <Path key={y} d={`M0 ${y}H1000`} />)}
      </G>
      {roomTypes.map((roomType, index) => {
        const { x, y } = baseRoomBounds(index);
        const active = selectedIndex === index;
        const roomOpacity = active ? 1 : 0.4;
        const accent = accents[roomType];
        const title = labels?.roomTypes[roomType];
        const status = labels?.roomStatuses[roomType];
        const titleSize = title && title.length > 5 ? 23 : 30;
        return (
          <G key={index} transform={`translate(${x} ${y})`}>
            <Rect opacity={roomOpacity} transform="translate(2 2)" width={276} height={136} fill={colors.appSurfaceRaised.val} fillOpacity={0.35} stroke={colors.appBorder.val} />
            <Path opacity={roomOpacity} d="M16 5H5V17M263 5H275V17M5 121V135H17M263 135H275V121M19 7H7V19M261 7H273V19M7 119V133H19M261 133H273V119" fill="none" stroke={colors.appAccentBorder.val} strokeOpacity={0.5} />
            <Path opacity={roomOpacity * 0.65} d={PANEL} transform="translate(0 3)" fill={colors.appBackground.val} />
            <Path opacity={roomOpacity} d={STRIPE} fill={accent} fillOpacity={active ? 0.95 : 0.65} stroke={accent} strokeOpacity={0.7} strokeWidth={1} />
            <Path opacity={roomOpacity} d={PANEL} fill={`url(#${id}-panel)`} stroke={colors.appBorderSolid.val} />
            {active ? <Path opacity={roomOpacity} d={PANEL} fill={colors.appAccent.val} fillOpacity={0.18} /> : null}
            <G clipPath={`url(#${id}-clip)`}>
              <Path opacity={roomOpacity * 0.09} d={ROOM_MOTIFS[roomType]} fill="none" stroke={colors.appAccent.val} strokeWidth={5} />
              <Path opacity={roomOpacity * 0.035} d="M46 11H87L158 49V128H127V61Z" fill={colors.appAccent.val} />
            </G>
            {title && status ? (
              <G>
                <Text opacity={roomOpacity} transform="translate(52 53)" fill={colors.appText.val} fontFamily="sans-serif" fontSize={titleSize}>{title}</Text>
                <G transform={`translate(${Math.min(235, 56 + title.length * titleSize * (title.length > 5 ? 0.51 : 1))} 31)`} fill={accent}>
                  {[0, 10, 20].map(offset => <Path key={offset} opacity={roomOpacity} transform={`translate(${offset} 0)`} d="M0 3L4 0L8 3V20L4 24L0 20Z" />)}
                </G>
                <Text opacity={roomOpacity} transform="translate(52 76)" fill={accent} fontFamily="sans-serif" fontSize={17} fontWeight="600">{status}</Text>
                <G transform={`translate(${56 + status.length * (status.length > 5 ? 10 : 17)} 63)`} fill={accent}>
                  {[0, 1, 2].map(step => (
                    <WorkPath key={step} progress={progress} step={step} count={3} roomOpacity={roomOpacity} transform={`translate(${step * 11} 0)`} d="M0 0L10 6L0 12Z" />
                  ))}
                </G>
              </G>
            ) : null}
            {[0, 1, 2, 3, 4].map(segment => (
              <WorkRect key={segment} progress={progress} step={segment} count={5} roomOpacity={roomOpacity} baseOpacity={active ? 0.8 : 0.65} dimOpacity={0.18} transform={`translate(${49 + segment * 43} 119)`} fill={active ? colors.appAccent.val : colors.appMuted.val} />
            ))}
            {active ? (
              <G fill="none" stroke={colors.appAccent.val}>
                <Path opacity={roomOpacity * 0.05} d={PANEL} strokeWidth={10} />
                <Path opacity={roomOpacity * 0.12} d={PANEL} strokeWidth={5} />
                <Path opacity={roomOpacity} d={PANEL} strokeWidth={3} />
                <Path opacity={roomOpacity * 0.15} d={STRIPE} strokeWidth={5} />
              </G>
            ) : null}
          </G>
        );
      })}
      <G transform="translate(850 145)">
        <Rect transform="translate(8 25)" width={124} height={90} fill={colors.appBorderSolid.val} stroke={colors.appAccentBorder.val} />
        <Rect transform="translate(9 26)" width={122} height={88} fill={colors.appAccent.val} fillOpacity={0.16} />
        <Path d="M20 28H11V37M120 28H129V37M11 103V112H20M120 112H129V103" fill="none" stroke={colors.appAccentBorder.val} />
        <Path d="M18 38H54L61 45H82L89 38H124L128 42V96L124 101H89L82 94H61L54 101H18L14 97V42Z" transform="translate(0 2)" fill={colors.appBackground.val} opacity={0.25} />
        <Path d="M18 38H54L61 45H82L89 38H124L128 42V96L124 101H89L82 94H61L54 101H18L14 97V42Z" fill={colors.appBackground.val} />
        <G transform="scale(0.42945)" fill={colors.appAccent.val}>
          <G>
            <Circle opacity={0.65} cx={148} cy={130} r={9} />
            {/* Outline traced from the reference: bent front leg and long diagonal rear leg. */}
            <Path opacity={0.65} d="M162 134H179L184 138L191 150V152L188 154L184 153L177 141H165L164 145L174 160L179 166V184L181 186H199L202 187V191L198 193L172 192L171 177L168 176L163 185L150 203L146 205H141L142 200L155 181L163 169L161 165L151 152L148 153L147 159L144 163H130L129 158L139 157L141 155L144 145L148 142L155 141Z" />
          </G>
          <Path d="M63 165L84 154V176ZM86 165L106 154V176ZM223 154L243 165L223 176ZM246 154L265 165L246 176Z" opacity={0.9} />
        </G>
      </G>
    </Svg>
  );
}
