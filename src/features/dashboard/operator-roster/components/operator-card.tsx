import { MaskedView } from '@expo/ui/community/masked-view';
import { Image } from 'expo-image';
import { memo, useMemo } from 'react';
import { StyleSheet, type ImageStyle, type StyleProp } from 'react-native';
import { XStack, YStack, styled } from 'tamagui';

import elite0 from '@/assets/images/operators/elite/prerendered/elite_0.webp';
import elite1 from '@/assets/images/operators/elite/prerendered/elite_1.webp';
import elite2 from '@/assets/images/operators/elite/prerendered/elite_2.webp';
import operatorCellBottomTransition from '@/assets/images/operators/cell-bottom-transition.png';
import operatorCellTicks from '@/assets/images/operators/cell-ticks.webp';
import operatorPortraitFadeMask from '@/assets/images/operators/portrait-fade-mask.png';
import operatorPortraitFilter from '@/assets/images/operators/portrait-filter.webp';
import potential0 from '@/assets/images/operators/potential/prerendered/potential_0.webp';
import potential1 from '@/assets/images/operators/potential/prerendered/potential_1.webp';
import potential2 from '@/assets/images/operators/potential/prerendered/potential_2.webp';
import potential3 from '@/assets/images/operators/potential/prerendered/potential_3.webp';
import potential4 from '@/assets/images/operators/potential/prerendered/potential_4.webp';
import potential5 from '@/assets/images/operators/potential/prerendered/potential_5.webp';
import { MonoText, TerminalMeterBar, TerminalPanel, TerminalText } from '@/components';
import type { Operator } from '@/schemas/game-account';
import type { LayoutSize } from '@/schemas/layout-size';
import { OPERATOR_PORTRAIT_GEOMETRY } from '../operator-portrait-config';
import { getOperatorPortraitUrl } from '../portrait-image';

export const OPERATOR_CARD_MIN_WIDTH = 140;
export const OPERATOR_CARD_MIN_HEIGHT = 164;

const OPERATOR_ELITE_ICON_WIDTH = 30;
const OPERATOR_ELITE_ICON_HEIGHT = 30;
const OPERATOR_ELITE_ICON_OFFSET = 10;
const OPERATOR_ELITE_ICON_BOTTOM = 44;
const OPERATOR_LEVEL_BOTTOM = 10;
const OPERATOR_LEVEL_LEFT = 10;
const OPERATOR_POTENTIAL_ICON_SIZE = 35;
const OPERATOR_POTENTIAL_ICON_OFFSET = 10;

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
  portraitLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: `${OPERATOR_PORTRAIT_GEOMETRY.layerWidthPercent}%`,
    pointerEvents: 'none',
  },
  portraitImage: {
    position: 'absolute',
    top: OPERATOR_PORTRAIT_GEOMETRY.topOffset,
    right: 0,
    width: `${OPERATOR_PORTRAIT_GEOMETRY.zoomPercent}%`,
    aspectRatio:
      OPERATOR_PORTRAIT_GEOMETRY.sourceWidth / OPERATOR_PORTRAIT_GEOMETRY.sourceHeight,
  },
  ticks: {
    position: 'absolute',
    top: 32,
    left: 2,
    width: 11,
    height: 70,
  },
  bottomTransition: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: 18,
  },
  eliteIcon: {
    position: 'absolute',
    left: OPERATOR_ELITE_ICON_OFFSET,
    bottom: OPERATOR_ELITE_ICON_BOTTOM,
    width: OPERATOR_ELITE_ICON_WIDTH,
    height: OPERATOR_ELITE_ICON_HEIGHT,
    zIndex: 2,
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
  },
});

export type OperatorCardLabels = {
  cellLevel: string;
  detailLevel: string;
  detailPotential: string;
  elite: Record<Operator['evolvePhase'], string>;
  potential: Record<Operator['potentialRank'], string>;
};

function formatLevel(level: number): string {
  return String(level).padStart(2, '0');
}

type OperatorStaticIconProps = {
  accessibilityLabel: string;
  charId: string;
  imageStyle: StyleProp<ImageStyle>;
  recyclingKey: string;
  source: number;
  testIdPrefix: string;
};

function OperatorStaticIcon({
  accessibilityLabel,
  charId,
  imageStyle,
  recyclingKey,
  source,
  testIdPrefix,
}: OperatorStaticIconProps) {
  return (
    <Image
      testID={`${testIdPrefix}-${charId}`}
      source={source}
      cachePolicy="memory-disk"
      contentFit="contain"
      recyclingKey={recyclingKey}
      accessibilityLabel={accessibilityLabel}
      style={imageStyle}
    />
  );
}

function OperatorCardTicks({ charId }: { charId: string }) {
  return (
    <Image
      testID={`operator-card-ticks-${charId}`}
      source={operatorCellTicks}
      cachePolicy="memory"
      contentFit="fill"
      style={styles.ticks}
      aria-hidden
    />
  );
}

function OperatorCellBottomTransition({ charId }: { charId: string }) {
  return (
    <Image
      testID={`operator-card-bottom-transition-${charId}`}
      source={operatorCellBottomTransition}
      cachePolicy="memory"
      contentFit="fill"
      style={styles.bottomTransition}
      aria-hidden
    />
  );
}

type OperatorPortraitImageProps = {
  charId: string;
  source: string;
  testID: string;
};

function OperatorPortraitImage({
  charId,
  source,
  testID,
}: OperatorPortraitImageProps) {
  const imageSource = useMemo(
    () => ({
      uri: source,
      width: OPERATOR_PORTRAIT_GEOMETRY.sourceWidth,
      height: OPERATOR_PORTRAIT_GEOMETRY.sourceHeight,
    }),
    [source],
  );

  return (
    <Image
      testID={testID}
      source={imageSource}
      cachePolicy="memory-disk"
      contentFit="contain"
      recyclingKey={charId}
      style={styles.portraitImage}
    />
  );
}

function OperatorPortraitBackdrop({ charId }: { charId: string }) {
  const portraitUrl = getOperatorPortraitUrl(charId);

  return (
    <MaskedView
      testID={`operator-card-edge-fade-mask-${charId}`}
      style={styles.portraitLayer}
      aria-hidden
      maskElement={
        <Image
          testID={`operator-card-edge-fade-image-${charId}`}
          source={operatorPortraitFadeMask}
          cachePolicy="memory"
          contentFit="fill"
          style={StyleSheet.absoluteFill}
          aria-hidden
        />
      }
    >
      <OperatorPortraitImage
        charId={`${charId}-portrait`}
        source={portraitUrl}
        testID={`operator-card-portrait-${charId}`}
      />
      <MaskedView
        testID={`operator-card-filter-${charId}`}
        style={StyleSheet.absoluteFill}
        maskElement={
          <OperatorPortraitImage
            charId={`${charId}-portrait-mask`}
            source={portraitUrl}
            testID={`operator-card-filter-mask-image-${charId}`}
          />
        }
      >
        <Image
          testID={`operator-card-filter-image-${charId}`}
          source={operatorPortraitFilter}
          cachePolicy="memory"
          contentFit="contain"
          style={styles.portraitImage}
          aria-hidden
        />
      </MaskedView>
    </MaskedView>
  );
}

function SmallOperatorCard({
  labels,
  name,
  operator,
}: {
  labels: OperatorCardLabels;
  name: string;
  operator: Operator;
}) {
  const level = formatLevel(operator.level);

  return (
    <SmallOperatorCardFrame testID={`operator-card-${operator.charId}`}>
      <OperatorPortraitBackdrop charId={operator.charId} />
      <OperatorCellBottomTransition charId={operator.charId} />
      <OperatorCardTicks charId={operator.charId} />
      <YStack grow={1} shrink={1} minW={0} minH={OPERATOR_CARD_MIN_HEIGHT} p="$2.5">
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
            {labels.cellLevel}
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
      <OperatorStaticIcon
        accessibilityLabel={labels.elite[operator.evolvePhase]}
        charId={operator.charId}
        imageStyle={styles.eliteIcon}
        recyclingKey={`${operator.charId}-elite-${operator.evolvePhase}`}
        source={OPERATOR_ELITE_IMAGES[operator.evolvePhase]}
        testIdPrefix="operator-card-elite"
      />
      <OperatorStaticIcon
        accessibilityLabel={labels.potential[operator.potentialRank]}
        charId={operator.charId}
        imageStyle={styles.potentialIcon}
        recyclingKey={`${operator.charId}-potential-${operator.potentialRank}`}
        source={OPERATOR_POTENTIAL_IMAGES[operator.potentialRank]}
        testIdPrefix="operator-card-potential"
      />
    </SmallOperatorCardFrame>
  );
}

export const OperatorCard = memo(function OperatorCard({
  labels,
  name,
  operator,
  size,
}: {
  labels: OperatorCardLabels;
  name: string;
  operator: Operator;
  size: LayoutSize;
}) {
  const level = operator.level;

  if (size === 'small') {
    return <SmallOperatorCard labels={labels} name={name} operator={operator} />;
  }

  return (
    <TerminalPanel testID={`operator-card-${operator.charId}`} minW={OPERATOR_CARD_MIN_WIDTH} grow={1} shrink={1} p="$3">
      <TerminalText size="$4" fontWeight="800" numberOfLines={1}>{name}</TerminalText>
      <XStack mt="$2" justify="space-between"><MonoText size="$1">{labels.detailLevel}</MonoText><MonoText size="$1" color="$appAccent">{level}</MonoText></XStack>
      <YStack mt="$1.5"><TerminalMeterBar value={level} max={90} /></YStack>
      <XStack mt="$2" justify="space-between"><MonoText size="$1">{labels.detailPotential}</MonoText><TerminalText size="$2">{operator.potentialRank}</TerminalText></XStack>
    </TerminalPanel>
  );
});
