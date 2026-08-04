import type { ComponentProps } from 'react';
import { Stack as JsStack } from 'expo-router/js-stack';
import { Animated, Easing } from 'react-native';

import { IOS_BACK_GESTURE_EDGE_WIDTH_PT } from '@/constants/back-navigation';
import { PAGE_TRANSITION_TIMING } from '@/constants/page-transition';

type ExcludeFunction<T> = T extends (...args: never[]) => unknown ? never : T;
type JsStackScreenOptions = ExcludeFunction<NonNullable<ComponentProps<typeof JsStack>['screenOptions']>>;
type CardStyleInterpolator = NonNullable<JsStackScreenOptions['cardStyleInterpolator']>;

const timingTransition = {
  animation: 'timing',
  config: {
    duration: PAGE_TRANSITION_TIMING.totalMs,
    easing: Easing.inOut(Easing.ease),
  },
} as const;

const transitionSpec: NonNullable<JsStackScreenOptions['transitionSpec']> = {
  open: timingTransition,
  close: timingTransition,
};

const SCOPE_PARALLAX_RATIO = 0.2;
const SCOPE_PREVIOUS_CARD_HIDE_START = 0.98;
const SCOPE_PREVIOUS_CARD_HIDE_END = 0.99;
const SCOPE_BACKGROUND_REVEAL_START = SCOPE_PREVIOUS_CARD_HIDE_END;

const routeCardStyleInterpolator: CardStyleInterpolator = ({ current, next }) => {
  if (next) {
    return {
      cardStyle: {
        opacity: next.progress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0, 0],
        }),
        transform: [{
          scale: next.progress.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 0.98, 0.98],
          }),
        }],
      },
    };
  }

  return {
    cardStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
      }),
    },
  };
};

function createScopeCardStyleInterpolator(cardBackgroundColor: string): CardStyleInterpolator {
  return ({ current, inverted, layouts, next }) => {
    const focusedTranslation = Animated.multiply(current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [layouts.screen.width, 0],
      extrapolate: 'clamp',
    }), inverted);
    const unfocusedTranslation = next
      ? Animated.multiply(next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -layouts.screen.width * SCOPE_PARALLAX_RATIO],
          extrapolate: 'clamp',
        }), inverted)
      : 0;

    return {
      cardStyle: {
        backgroundColor: current.progress.interpolate({
          inputRange: [0, SCOPE_BACKGROUND_REVEAL_START, 1],
          outputRange: [cardBackgroundColor, cardBackgroundColor, 'transparent'],
          extrapolate: 'clamp',
        }),
        opacity: next
          ? next.progress.interpolate({
              inputRange: [0, SCOPE_PREVIOUS_CARD_HIDE_START, SCOPE_PREVIOUS_CARD_HIDE_END, 1],
              outputRange: [1, 1, 0, 0],
              extrapolate: 'clamp',
            })
          : 1,
        transform: [
          { translateX: focusedTranslation },
          { translateX: unfocusedTranslation },
        ],
      },
    };
  };
}

type RouteScreenOptionsPolicy = {
  enableIosBackGesture?: boolean;
  platform?: string;
};

type ScopeTransitionScreenOptionsPolicy = {
  cardBackgroundColor: string;
  platform?: string;
};

export function getRouteScreenOptions(
  reducedMotion: boolean,
  policy: RouteScreenOptionsPolicy = {},
): JsStackScreenOptions {
  const sharedOptions: JsStackScreenOptions = {
    cardOverlayEnabled: false,
    cardStyle: { backgroundColor: 'transparent' },
    detachPreviousScreen: false,
    gestureEnabled: false,
    headerShown: false,
  };

  const routeOptions: JsStackScreenOptions = reducedMotion
    ? { ...sharedOptions, animation: 'none' }
    : {
      ...sharedOptions,
      animation: 'default',
      animationTypeForReplace: 'push',
      cardStyleInterpolator: routeCardStyleInterpolator,
      transitionSpec,
    };

  const platform = policy.platform ?? process.env.EXPO_OS;
  if (!policy.enableIosBackGesture || platform !== 'ios') return routeOptions;

  return {
    ...routeOptions,
    gestureDirection: 'horizontal',
    gestureEnabled: true,
    gestureResponseDistance: IOS_BACK_GESTURE_EDGE_WIDTH_PT,
  };
}

export function getScopeTransitionScreenOptions(
  reducedMotion: boolean,
  policy: ScopeTransitionScreenOptionsPolicy,
): JsStackScreenOptions {
  const sharedOptions: JsStackScreenOptions = {
    cardOverlayEnabled: false,
    cardShadowEnabled: false,
    cardStyle: { backgroundColor: 'transparent' },
    detachPreviousScreen: false,
    gestureEnabled: false,
    headerShown: false,
  };
  const platform = policy.platform ?? process.env.EXPO_OS;

  if (reducedMotion) {
    return {
      ...sharedOptions,
      animation: 'none',
      detachPreviousScreen: true,
    };
  }

  return {
    ...sharedOptions,
    animation: 'default',
    animationTypeForReplace: 'push',
    cardStyleInterpolator: createScopeCardStyleInterpolator(policy.cardBackgroundColor),
    gestureDirection: 'horizontal',
    gestureEnabled: platform === 'ios',
    gestureResponseDistance: IOS_BACK_GESTURE_EDGE_WIDTH_PT,
    transitionSpec,
  };
}
