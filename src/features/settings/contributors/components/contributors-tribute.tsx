import { useCallback, useEffect, useId, useRef } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import { XStack, YStack, getTokens } from 'tamagui';

import { MonoText, TerminalText } from '@/components';

const REVEAL_DURATION_MS = 600;
const IDENTITY_REVEAL_DELAY_MS = REVEAL_DURATION_MS + 150;
const IDENTITY_REVEAL_DURATION_MS = 1000;
const IDENTITY_REVEAL_OFFSET_X = 18;
const IDENTITY_REVEAL_OFFSET_Y = 4;
const IDENTITY_REVEAL_START_SCALE = 0.985;
const SCAN_DURATION_MS = 1_500;
const SCAN_REST_DURATION_MS = 2_000;
const SCAN_BEAM_WIDTH = 180;
const HOVER_DEPTH_OFFSET = 10;

const hoverSpring = {
  damping: 24,
  mass: 0.8,
  stiffness: 260,
} as const;

type ContributorsTributeProps = {
  body: string;
  recipientCode: string;
  recipientCallsign: string;
  recipientPrefix: string;
  recipientTitle: string;
};

function TributeSignalArtwork({
  hoverDepth,
  reducedMotion,
  scanX,
}: {
  hoverDepth: SharedValue<number>;
  reducedMotion: boolean;
  scanX: SharedValue<number>;
}) {
  const colors = getTokens().color;
  const gradientId = useId().replace(/:/g, '');
  const signalGradientFill = `url(#${gradientId}-signal)`;
  const scanGradientFill = `url(#${gradientId}-scan)`;
  const scanStyle = useAnimatedStyle(() => ({
    opacity: reducedMotion ? 0 : 1,
    transform: [{ translateX: scanX.get() + hoverDepth.get() }],
  }));

  return (
    <YStack
      position="absolute"
      t={0}
      b={0}
      l={0}
      r={0}
      aria-hidden
      style={{ pointerEvents: 'none' }}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 160"
        preserveAspectRatio="none"
        style={styles.artwork}
      >
        <Defs>
          <SvgLinearGradient id={`${gradientId}-signal`} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.appAccent.val} stopOpacity={0} />
            <Stop offset="16%" stopColor={colors.appAccent.val} stopOpacity={0.18} />
            <Stop offset="72%" stopColor={colors.appAccent.val} stopOpacity={0.38} />
            <Stop offset="100%" stopColor={colors.appWarning.val} stopOpacity={0.48} />
          </SvgLinearGradient>
        </Defs>
        <Path
          d="M0 108 H640 L654 94 L670 123 L686 108 H1000"
          fill="none"
          stroke={signalGradientFill}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <Path
          d="M0 42 H246 M754 42 H1000"
          fill="none"
          stroke={colors.appGrid.val}
          strokeWidth={1}
          strokeDasharray="5 8"
          vectorEffect="non-scaling-stroke"
        />
      </Svg>

      <Animated.View style={[styles.scanBeam, scanStyle]}>
        <Svg width={SCAN_BEAM_WIDTH} height="100%">
          <Defs>
            <SvgLinearGradient id={`${gradientId}-scan`} x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={colors.appAccent.val} stopOpacity={0} />
              <Stop offset="44%" stopColor={colors.appAccent.val} stopOpacity={0.02} />
              <Stop offset="62%" stopColor={colors.appAccent.val} stopOpacity={0.14} />
              <Stop offset="78%" stopColor={colors.appWarning.val} stopOpacity={0.08} />
              <Stop offset="100%" stopColor={colors.appWarning.val} stopOpacity={0} />
            </SvgLinearGradient>
          </Defs>
          <Rect width={SCAN_BEAM_WIDTH} height="100%" fill={scanGradientFill} />
        </Svg>
      </Animated.View>
    </YStack>
  );
}

export function ContributorsTribute({
  body,
  recipientCode,
  recipientCallsign,
  recipientPrefix,
  recipientTitle,
}: ContributorsTributeProps) {
  const reducedMotion = useReducedMotion();
  const revealProgress = useSharedValue(reducedMotion ? 1 : 0);
  const identityProgress = useSharedValue(reducedMotion ? 1 : 0);
  const scanX = useSharedValue(-SCAN_BEAM_WIDTH);
  const hoverDepth = useSharedValue(0);
  const scanWidthRef = useRef(0);

  useEffect(() => {
    if (reducedMotion) {
      revealProgress.set(1);
      identityProgress.set(1);
    } else {
      revealProgress.set(withTiming(1, {
        duration: REVEAL_DURATION_MS,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      }));
      identityProgress.set(withDelay(
        IDENTITY_REVEAL_DELAY_MS,
        withTiming(1, {
          duration: IDENTITY_REVEAL_DURATION_MS,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        }),
      ));
    }

    return () => {
      cancelAnimation(revealProgress);
      cancelAnimation(identityProgress);
      cancelAnimation(scanX);
      cancelAnimation(hoverDepth);
    };
  }, [hoverDepth, identityProgress, reducedMotion, revealProgress, scanX]);

  const startScan = useCallback((width: number) => {
    cancelAnimation(scanX);
    scanX.set(-SCAN_BEAM_WIDTH);
    if (reducedMotion || width <= 0) return;

    const scanDestination = width + SCAN_BEAM_WIDTH;
    scanX.set(withRepeat(
      withSequence(
        withTiming(scanDestination, {
          duration: SCAN_DURATION_MS,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(-SCAN_BEAM_WIDTH, { duration: 0 }),
        withDelay(
          SCAN_REST_DURATION_MS,
          withTiming(-SCAN_BEAM_WIDTH, { duration: 0 }),
        ),
      ),
      -1,
    ));
  }, [reducedMotion, scanX]);

  useEffect(() => {
    if (scanWidthRef.current > 0) startScan(scanWidthRef.current);
  }, [reducedMotion, startScan]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    scanWidthRef.current = event.nativeEvent.layout.width;
    startScan(scanWidthRef.current);
  }, [startScan]);

  const handleHoverIn = useCallback(() => {
    if (!reducedMotion) hoverDepth.set(withSpring(HOVER_DEPTH_OFFSET, hoverSpring));
  }, [hoverDepth, reducedMotion]);

  const handleHoverOut = useCallback(() => {
    if (!reducedMotion) hoverDepth.set(withSpring(0, hoverSpring));
  }, [hoverDepth, reducedMotion]);

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: revealProgress.get(),
    transform: [{ translateY: 14 * (1 - revealProgress.get()) }],
  }));
  const identityStyle = useAnimatedStyle(() => {
    const progress = identityProgress.get();
    return {
      opacity: interpolate(progress, [0, 0.6, 1], [0, 0.82, 1], Extrapolation.CLAMP),
      transform: [
        { translateX: (IDENTITY_REVEAL_OFFSET_X * (1 - progress)) + hoverDepth.get() },
        { translateY: IDENTITY_REVEAL_OFFSET_Y * (1 - progress) },
        { scale: IDENTITY_REVEAL_START_SCALE + ((1 - IDENTITY_REVEAL_START_SCALE) * progress) },
      ],
    };
  });
  const backdropWordStyle = useAnimatedStyle(() => ({
    opacity: 0.12 * revealProgress.get(),
    transform: [
      { translateX: hoverDepth.get() * -0.65 },
      { translateY: 8 * (1 - revealProgress.get()) },
    ],
  }));
  return (
    <YStack
      testID="contributors-tribute"
      position="relative"
      overflow="hidden"
      px="$3.5"
      py="$2"
      bg="$appSurfaceRaisedTranslucent"
      onLayout={handleLayout}
      onPointerEnter={handleHoverIn}
      onPointerLeave={handleHoverOut}
      $md={{ px: '$5', py: '$3' }}
      $platform-web={{
        clipPath: 'polygon(0 12px, 12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)',
      }}
    >
      <TributeSignalArtwork
        hoverDepth={hoverDepth}
        reducedMotion={reducedMotion}
        scanX={scanX}
      />

      <Animated.View
        aria-hidden
        style={[styles.backdropWord, backdropWordStyle]}
      >
        <TerminalText
          fontSize={92}
          lineHeight={96}
          fontWeight="800"
          letterSpacing={-6}
          color="$appAccentSoft"
          textTransform="uppercase"
        >
          {recipientCode}
        </TerminalText>
      </Animated.View>

      <YStack
        position="relative"
        z={1}
        gap="$4"
        $md={{ gap: '$4' }}
      >
        <Animated.View style={[styles.animatedContent, bodyStyle]}>
          <MonoText
            testID="contributors-tribute-body"
            size="$3"
            lineHeight="$4"
            color="$appText"
            select="text"
          >
            {body}
          </MonoText>
        </Animated.View>

        <Animated.View style={[styles.animatedContent, identityStyle]}>
          <YStack
            testID="contributors-tribute-recipient-card"
            width="100%"
            minW={0}
            gap="$2"
            pt="$1"
            $md={{ gap: '$2.5', pt: '$2' }}
          >
            <XStack
              self="flex-start"
              maxW="100%"
              minW={0}
              px="$2"
              py="$0.5"
              bg="$appWarning"
              $md={{ px: '$2.5' }}
            >
              <MonoText
                testID="contributors-tribute-recipient-title"
                maxW="100%"
                minW={0}
                shrink={1}
                size="$2.5"
                lineHeight="$3"
                color="$appBackground"
                fontWeight="800"
                letterSpacing={1.2}
                textTransform="uppercase"
                select="text"
              >
                {recipientTitle}
              </MonoText>
            </XStack>
            <XStack
              testID="contributors-tribute-recipient"
              width="100%"
              minW={0}
              items="baseline"
              flexWrap="wrap"
              gap="$1.5"
              pb="$1.5"
              $md={{ pb: '$2' }}
            >
              <TerminalText
                testID="contributors-tribute-recipient-prefix"
                size="$2.5"
                lineHeight="$3"
                color="$appText"
                fontWeight="700"
                letterSpacing={1.2}
                textTransform="uppercase"
                shrink={0}
                select="text"
                $xxs={{ size: '$3', lineHeight: '$3' }}
                $xs={{ size: '$3', lineHeight: '$4' }}
                $md={{ size: '$4', lineHeight: '$4' }}
              >
                {recipientPrefix}
              </TerminalText>
              <TerminalText
                testID="contributors-tribute-recipient-callsign"
                minW={0}
                shrink={1}
                size="$7"
                lineHeight="$8"
                fontWeight="900"
                color="$appWarning"
                letterSpacing={-0.6}
                textTransform="uppercase"
                select="text"
                $xxs={{ size: '$8', lineHeight: '$8' }}
                $xs={{ size: '$9', lineHeight: '$9' }}
                $md={{ size: '$10', lineHeight: '$10' }}
              >
                {recipientCallsign}
              </TerminalText>
            </XStack>
          </YStack>
        </Animated.View>
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  artwork: {
    bottom: 0,
    left: 0,
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  backdropWord: {
    left: 16,
    pointerEvents: 'none',
    position: 'absolute',
    top: -24,
  },
  animatedContent: {
    width: '100%',
  },
  scanBeam: {
    bottom: 0,
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    width: SCAN_BEAM_WIDTH,
  },
});
