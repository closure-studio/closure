import type { ComponentProps } from 'react';
import { Stack as JsStack } from 'expo-router/js-stack';
import { Easing } from 'react-native';

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

type RouteScreenOptionsPolicy = {
  enableIosBackGesture?: boolean;
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
