import { Image } from 'expo-image';
import { memo, useId } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInRight, useReducedMotion } from 'react-native-reanimated';
import Svg, {
  Defs,
  G,
  Image as SvgImage,
  LinearGradient as SvgLinearGradient,
  Mask,
  Rect,
  Stop,
} from 'react-native-svg';
import { getTokens, XStack, YStack, styled } from 'tamagui';
import { useTranslation } from 'react-i18next';

import { AvatarFilter, MonoText, TerminalMeterBar, TerminalPanel, TerminalText } from '@/components';
import elite0 from '@/assets/images/operators/elite/elite_0.webp';
import elite1 from '@/assets/images/operators/elite/elite_1.webp';
import elite2 from '@/assets/images/operators/elite/elite_2.webp';
import potential0 from '@/assets/images/operators/potential/potential_0.webp';
import potential1 from '@/assets/images/operators/potential/potential_1.webp';
import potential2 from '@/assets/images/operators/potential/potential_2.webp';
import potential3 from '@/assets/images/operators/potential/potential_3.webp';
import potential4 from '@/assets/images/operators/potential/potential_4.webp';
import potential5 from '@/assets/images/operators/potential/potential_5.webp';
import type { LayoutSize } from '@/schemas/layout-size';
import type { Operator } from '@/schemas/game-account';
import { getOperatorPortraitUrl } from '../portrait-image';

export const OPERATOR_CARD_MIN_WIDTH = 140;
export const OPERATOR_CARD_MIN_HEIGHT = 164;

const OPERATOR_REVEAL_STAGGER_MS = 45;
const OPERATOR_PORTRAIT_SOURCE_WIDTH = 180;
const OPERATOR_PORTRAIT_SOURCE_HEIGHT = 360;
const OPERATOR_PORTRAIT_ZOOM = 1.2;
const OPERATOR_PORTRAIT_VERTICAL_SHIFT_PX = 10;
const OPERATOR_CELL_BOTTOM_TRANSITION_HEIGHT = 18;
const OPERATOR_ELITE_ICON_WIDTH = 30;
const OPERATOR_ELITE_ICON_HEIGHT = 30;
const OPERATOR_ELITE_ICON_OFFSET = 10;
const OPERATOR_ELITE_ICON_BOTTOM = 44;
const OPERATOR_LEVEL_BOTTOM = 10;
const OPERATOR_LEVEL_LEFT = 10;
const OPERATOR_POTENTIAL_ICON_SIZE = 30;
const OPERATOR_POTENTIAL_ICON_OFFSET = 10;
const PORTRAIT_FADE_COLOR = '#ffffff';
const OPERATOR_PORTRAIT_EDGE_FADE_STOPS = [
  { offset: '0%', opacity: 1 },
  { offset: '58%', opacity: 1 },
  { offset: '74%', opacity: 0.74 },
  { offset: '89%', opacity: 0.28 },
  { offset: '100%', opacity: 0 },
] as const;
const OPERATOR_CELL_BOTTOM_TRANSITION_STOPS = [
  { offset: '0%', opacity: 0 },
  { offset: '42%', opacity: 0.08 },
  { offset: '76%', opacity: 0.3 },
  { offset: '100%', opacity: 0.62 },
] as const;
const unavailable = '—';
const OPERATOR_ELITE_IMAGES = {
  0: elite0,
  1: elite1,
  2: elite2,
} satisfies Record<Operator['evolvePhase'], number>;
const OPERATOR_POTENTIAL_IMAGES = {
  0: potential0,
  1: potential1,
  2: potential2,
  3: potential3,
  4: potential4,
  5: potential5,
} satisfies Record<Operator['potentialRank'], number>;

const SmallOperatorCardFrame = styled(YStack, {
  name: 'SmallOperatorCard',
  position: 'relative',
  minW: OPERATOR_CARD_MIN_WIDTH,
  minH: OPERATOR_CARD_MIN_HEIGHT,
  grow: 1,
  shrink: 1,
  overflow: 'hidden',
  bg: 'transparent',
  rounded: '$0',
});

const styles = StyleSheet.create({
  animatedCard: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: OPERATOR_CARD_MIN_WIDTH,
  },
  portraitMotion: {
    flex: 1,
  },
  portraitLayer: {
    right: 0,
    width: '50%',
    pointerEvents: 'none',
  },
  transitionLayer: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  bottomTransition: {
    right: 0,
    bottom: 0,
    left: 0,
  },
  eliteIcon: {
    position: 'absolute',
    left: OPERATOR_ELITE_ICON_OFFSET,
    bottom: OPERATOR_ELITE_ICON_BOTTOM,
    width: OPERATOR_ELITE_ICON_WIDTH,
    height: OPERATOR_ELITE_ICON_HEIGHT,
    zIndex: 2,
    pointerEvents: 'none',
  },
  levelBlock: {
    position: 'absolute',
    left: OPERATOR_LEVEL_LEFT,
    bottom: OPERATOR_LEVEL_BOTTOM,
    zIndex: 2,
  },
  potentialIcon: {
    position: 'absolute',
    right: OPERATOR_POTENTIAL_ICON_OFFSET,
    bottom: OPERATOR_POTENTIAL_ICON_OFFSET,
    width: OPERATOR_POTENTIAL_ICON_SIZE,
    height: OPERATOR_POTENTIAL_ICON_SIZE,
    zIndex: 2,
    pointerEvents: 'none',
  },
  potentialFilter: {
    pointerEvents: 'none',
  },
});

function formatLevel(level: number | undefined): string {
  return level === undefined ? unavailable : String(level).padStart(2, '0');
}

type OperatorMaskedIconProps = {
  accessibilityLabel: string;
  charId: string;
  frameStyle: StyleProp<ViewStyle>;
  recyclingKey: string;
  size: { height: number; width: number };
  source: number;
  testIdPrefix: string;
};

function OperatorMaskedIcon({
  accessibilityLabel,
  charId,
  frameStyle,
  recyclingKey,
  size,
  source,
  testIdPrefix,
}: OperatorMaskedIconProps) {
  const filterId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const maskId = `${testIdPrefix}-alpha-mask-${filterId}`;

  return (
    <YStack
      testID={`${testIdPrefix}-frame-${charId}`}
      style={frameStyle}
    >
      <Image
        testID={`${testIdPrefix}-${charId}`}
        source={source}
        cachePolicy="memory-disk"
        contentFit="contain"
        recyclingKey={recyclingKey}
        accessibilityLabel={accessibilityLabel}
        style={StyleSheet.absoluteFill}
      />
      <Svg
        testID={`${testIdPrefix}-filter-${charId}`}
        width={size.width}
        height={size.height}
        viewBox={`0 0 ${size.width} ${size.height}`}
        style={[StyleSheet.absoluteFill, styles.potentialFilter]}
        aria-hidden
      >
        <Defs>
          <Mask
            testID={`${testIdPrefix}-filter-mask-${charId}`}
            id={maskId}
            width={size.width}
            height={size.height}
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
            maskType="alpha"
          >
            <SvgImage
              testID={`${testIdPrefix}-filter-mask-image-${charId}`}
              href={source}
              width={size.width}
              height={size.height}
              preserveAspectRatio="xMidYMid meet"
            />
          </Mask>
        </Defs>
        <G
          testID={`${testIdPrefix}-filter-layer-${charId}`}
          mask={`url(#${maskId})`}
          aria-hidden
        >
          <AvatarFilter testID={`${testIdPrefix}-filter-svg-${charId}`} />
        </G>
      </Svg>
    </YStack>
  );
}

function OperatorCardTicks({ charId }: { charId: string }) {
  const tickWidths = [
    8, 5, 11, 6, 9, 4, 7, 10,
    8, 5, 11, 6, 9, 4, 7, 10,
    8, 5, 11, 6, 9, 4, 7, 10,
  ] as const;

  return (
    <YStack
      testID={`operator-card-ticks-${charId}`}
      position="absolute"
      t="$6"
      l="$1"
      gap="$1"
      aria-hidden
      style={{ pointerEvents: 'none' }}
    >
      {tickWidths.map((width, index) => (
        <YStack key={`tick-${index}`} width={width} height={1} bg="$appRule" />
      ))}
    </YStack>
  );
}

function OperatorCellBottomTransition({ charId }: { charId: string }) {
  const transitionId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const colors = getTokens().color;
  const bottomGradientId = `operator-cell-bottom-transition-${transitionId}`;

  return (
    <Svg
      testID={`operator-card-bottom-transition-${charId}`}
      width="100%"
      height={OPERATOR_CELL_BOTTOM_TRANSITION_HEIGHT}
      viewBox={`0 0 100 ${OPERATOR_CELL_BOTTOM_TRANSITION_HEIGHT}`}
      preserveAspectRatio="none"
      style={[styles.transitionLayer, styles.bottomTransition]}
      aria-hidden
    >
      <Defs>
        <SvgLinearGradient id={bottomGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          {OPERATOR_CELL_BOTTOM_TRANSITION_STOPS.map((stop) => (
            <Stop
              key={stop.offset}
              offset={stop.offset}
              stopColor={colors.appBackground.val}
              stopOpacity={stop.opacity}
            />
          ))}
        </SvgLinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${bottomGradientId})`} />
    </Svg>
  );
}

function OperatorPortraitBackdrop({
  charId,
  label,
  reducedMotion,
  displayIndex,
}: {
  charId: string;
  label: string;
  reducedMotion: boolean;
  displayIndex: number;
}) {
  const filterId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const portraitUrl = getOperatorPortraitUrl(charId);
  const portraitMaskId = `operator-portrait-alpha-mask-${filterId}`;
  const leftFadeMaskId = `operator-left-fade-mask-${filterId}`;
  const leftFadeGradientId = `operator-left-fade-gradient-${filterId}`;
  const rightFadeMaskId = `operator-right-fade-mask-${filterId}`;
  const rightFadeGradientId = `operator-right-fade-gradient-${filterId}`;
  const bottomFadeMaskId = `operator-bottom-fade-mask-${filterId}`;
  const bottomFadeGradientId = `operator-bottom-fade-gradient-${filterId}`;
  const portraitZoomOffsetX = Math.round(
    OPERATOR_PORTRAIT_SOURCE_WIDTH * (1 - OPERATOR_PORTRAIT_ZOOM),
  );
  const portraitZoomOffsetY = -Math.round(
    (OPERATOR_PORTRAIT_SOURCE_HEIGHT / OPERATOR_CARD_MIN_HEIGHT) * OPERATOR_PORTRAIT_VERTICAL_SHIFT_PX,
  );
  const portraitEntering = reducedMotion
    ? undefined
    : FadeInRight
      .springify()
      .damping(19)
      .stiffness(160)
      .mass(0.8)
      .delay(Math.min(displayIndex, 5) * OPERATOR_REVEAL_STAGGER_MS + 30);

  return (
    <YStack
      testID={`operator-card-portrait-layer-${charId}`}
      position="absolute"
      t={0}
      b={0}
      style={styles.portraitLayer}
      aria-hidden
    >
      <Animated.View
        {...(portraitEntering ? { entering: portraitEntering } : {})}
        style={styles.portraitMotion}
      >
        <Svg
          testID={`operator-card-portrait-svg-${charId}`}
          width="100%"
          height="100%"
          viewBox={`0 0 ${OPERATOR_PORTRAIT_SOURCE_WIDTH} ${OPERATOR_PORTRAIT_SOURCE_HEIGHT}`}
          preserveAspectRatio="none"
          style={StyleSheet.absoluteFill}
        >
          <Defs>
            <Mask
              testID={`operator-card-filter-mask-${charId}`}
              id={portraitMaskId}
              width={OPERATOR_PORTRAIT_SOURCE_WIDTH}
              height={OPERATOR_PORTRAIT_SOURCE_HEIGHT}
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
              maskType="alpha"
            >
              <SvgImage
                testID={`operator-card-filter-mask-image-${charId}`}
                href={portraitUrl}
                width={OPERATOR_PORTRAIT_SOURCE_WIDTH}
                height={OPERATOR_PORTRAIT_SOURCE_HEIGHT}
                preserveAspectRatio="xMaxYMin meet"
              />
            </Mask>
            <SvgLinearGradient id={leftFadeGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={PORTRAIT_FADE_COLOR} stopOpacity={0} />
              <Stop offset="24%" stopColor={PORTRAIT_FADE_COLOR} stopOpacity={0.08} />
              <Stop offset="52%" stopColor={PORTRAIT_FADE_COLOR} stopOpacity={0.52} />
              <Stop offset="76%" stopColor={PORTRAIT_FADE_COLOR} stopOpacity={1} />
              <Stop offset="100%" stopColor={PORTRAIT_FADE_COLOR} stopOpacity={1} />
            </SvgLinearGradient>
            <Mask
              testID={`operator-card-left-fade-mask-${charId}`}
              id={leftFadeMaskId}
              width={OPERATOR_PORTRAIT_SOURCE_WIDTH}
              height={OPERATOR_PORTRAIT_SOURCE_HEIGHT}
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
              maskType="alpha"
            >
              <Rect
                width={OPERATOR_PORTRAIT_SOURCE_WIDTH}
                height={OPERATOR_PORTRAIT_SOURCE_HEIGHT}
                fill={`url(#${leftFadeGradientId})`}
              />
            </Mask>
            <SvgLinearGradient id={rightFadeGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              {OPERATOR_PORTRAIT_EDGE_FADE_STOPS.map((stop) => (
                <Stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor={PORTRAIT_FADE_COLOR}
                  stopOpacity={stop.opacity}
                />
              ))}
            </SvgLinearGradient>
            <Mask
              testID={`operator-card-right-fade-mask-${charId}`}
              id={rightFadeMaskId}
              width={OPERATOR_PORTRAIT_SOURCE_WIDTH}
              height={OPERATOR_PORTRAIT_SOURCE_HEIGHT}
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
              maskType="alpha"
            >
              <Rect
                width={OPERATOR_PORTRAIT_SOURCE_WIDTH}
                height={OPERATOR_PORTRAIT_SOURCE_HEIGHT}
                fill={`url(#${rightFadeGradientId})`}
              />
            </Mask>
            <SvgLinearGradient id={bottomFadeGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              {OPERATOR_PORTRAIT_EDGE_FADE_STOPS.map((stop) => (
                <Stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor={PORTRAIT_FADE_COLOR}
                  stopOpacity={stop.opacity}
                />
              ))}
            </SvgLinearGradient>
            <Mask
              testID={`operator-card-bottom-fade-mask-${charId}`}
              id={bottomFadeMaskId}
              width={OPERATOR_PORTRAIT_SOURCE_WIDTH}
              height={OPERATOR_PORTRAIT_SOURCE_HEIGHT}
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
              maskType="alpha"
            >
              <Rect
                width={OPERATOR_PORTRAIT_SOURCE_WIDTH}
                height={OPERATOR_PORTRAIT_SOURCE_HEIGHT}
                fill={`url(#${bottomFadeGradientId})`}
              />
            </Mask>
          </Defs>
          <G
            testID={`operator-card-portrait-zoom-${charId}`}
            transform={`translate(${portraitZoomOffsetX} ${portraitZoomOffsetY}) scale(${OPERATOR_PORTRAIT_ZOOM})`}
          >
            <G testID={`operator-card-bottom-fade-${charId}`} mask={`url(#${bottomFadeMaskId})`}>
              <G testID={`operator-card-left-fade-${charId}`} mask={`url(#${leftFadeMaskId})`}>
                <G testID={`operator-card-right-fade-${charId}`} mask={`url(#${rightFadeMaskId})`}>
                  <G
                    testID={`operator-card-filter-${charId}`}
                    mask={`url(#${portraitMaskId})`}
                    aria-hidden
                  >
                    <SvgImage
                      testID={`operator-card-portrait-${charId}`}
                      href={portraitUrl}
                      width={OPERATOR_PORTRAIT_SOURCE_WIDTH}
                      height={OPERATOR_PORTRAIT_SOURCE_HEIGHT}
                      preserveAspectRatio="xMaxYMin meet"
                      accessibilityLabel={label}
                    />
                    <AvatarFilter testID={`operator-card-filter-svg-${charId}`} />
                  </G>
                </G>
              </G>
            </G>
          </G>
        </Svg>
      </Animated.View>
    </YStack>
  );
}

function SmallOperatorCard({
  displayIndex,
  name,
  operator,
}: {
  displayIndex: number;
  name: string;
  operator: Operator;
}) {
  const { t } = useTranslation('dashboard');
  const reducedMotion = useReducedMotion();
  const level = formatLevel(operator.level);
  const entering = reducedMotion
    ? undefined
    : FadeInRight
      .springify()
      .damping(18)
      .stiffness(150)
      .mass(0.8)
      .delay(Math.min(displayIndex, 5) * OPERATOR_REVEAL_STAGGER_MS);

  return (
    <Animated.View
      testID={`operator-card-motion-${operator.charId}`}
      {...(entering ? { entering } : {})}
      style={styles.animatedCard}
    >
      <SmallOperatorCardFrame testID={`operator-card-${operator.charId}`}>
        <OperatorPortraitBackdrop
          charId={operator.charId}
          label={name}
          reducedMotion={reducedMotion}
          displayIndex={displayIndex}
        />
        <OperatorCellBottomTransition charId={operator.charId} />
        <OperatorCardTicks charId={operator.charId} />
        <YStack
          grow={1}
          shrink={1}
          minW={0}
          minH={OPERATOR_CARD_MIN_HEIGHT}
          p="$2.5"
        >
          <YStack position="absolute" t="40%" l="$2.5" z={1} minW={0} maxW="94%" shrink={1}>
            <TerminalText
              testID={`operator-card-name-${operator.charId}`}
              minW={0}
              shrink={1}
              size="$3"
              lineHeight="$3"
              fontWeight="800"
              numberOfLines={2}
            >
              {name}
            </TerminalText>
          </YStack>
          <XStack
            testID={`operator-card-level-block-${operator.charId}`}
            shrink={0}
            items="baseline"
            gap="$1"
            style={styles.levelBlock}
          >
            <MonoText testID={`operator-card-level-label-${operator.charId}`} size="$1" color="$appMuted">
              {t('operators.cell.levelLabel')}
            </MonoText>
            <MonoText
              testID={`operator-card-level-${operator.charId}`}
              size="$8"
              lineHeight="$8"
              color="$appAccent"
            >
              {level}
            </MonoText>
          </XStack>
        </YStack>
        <OperatorMaskedIcon
          accessibilityLabel={t('operators.cell.eliteLabel', {
            rank: operator.evolvePhase,
          })}
          charId={operator.charId}
          frameStyle={styles.eliteIcon}
          recyclingKey={`${operator.charId}-elite-${operator.evolvePhase}`}
          size={{ height: OPERATOR_ELITE_ICON_HEIGHT, width: OPERATOR_ELITE_ICON_WIDTH }}
          source={OPERATOR_ELITE_IMAGES[operator.evolvePhase]}
          testIdPrefix="operator-card-elite"
        />
        <OperatorMaskedIcon
          accessibilityLabel={t('operators.cell.potentialLabel', {
            rank: operator.potentialRank + 1,
          })}
          charId={operator.charId}
          frameStyle={styles.potentialIcon}
          recyclingKey={`${operator.charId}-potential-${operator.potentialRank}`}
          size={{ height: OPERATOR_POTENTIAL_ICON_SIZE, width: OPERATOR_POTENTIAL_ICON_SIZE }}
          source={OPERATOR_POTENTIAL_IMAGES[operator.potentialRank]}
          testIdPrefix="operator-card-potential"
        />
      </SmallOperatorCardFrame>
    </Animated.View>
  );
}

export const OperatorCard = memo(function OperatorCard({
  displayIndex,
  name,
  operator,
  size,
}: {
  displayIndex: number;
  name: string;
  operator: Operator;
  size: LayoutSize;
}) {
  const { t } = useTranslation('dashboard');
  const level = operator.level;

  if (size === 'small') {
    return <SmallOperatorCard displayIndex={displayIndex} name={name} operator={operator} />;
  }

  return (
    <TerminalPanel testID={`operator-card-${operator.charId}`} minW={OPERATOR_CARD_MIN_WIDTH} grow={1} shrink={1} p="$3">
      <TerminalText size="$4" fontWeight="800" numberOfLines={1}>{name}</TerminalText>
      <XStack mt="$2" justify="space-between"><MonoText size="$1">{t('operators.detail.level')}</MonoText><MonoText size="$1" color="$appAccent">{level ?? unavailable}</MonoText></XStack>
      {level !== undefined ? <YStack mt="$1.5"><TerminalMeterBar value={level} max={90} /></YStack> : null}
      <XStack mt="$2" justify="space-between"><MonoText size="$1">{t('operators.detail.potential')}</MonoText><TerminalText size="$2">{operator.potentialRank ?? unavailable}</TerminalText></XStack>
    </TerminalPanel>
  );
});
