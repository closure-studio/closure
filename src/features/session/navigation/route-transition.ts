import type { ComponentProps } from 'react';
import { Stack as JsStack } from 'expo-router/js-stack';
import type { BottomTabNavigationOptions } from 'expo-router/tabs';
import { Easing } from 'react-native';

import { PAGE_TRANSITION_TIMING } from '@/constants/page-transition';

type ExcludeFunction<T> = T extends (...args: never[]) => unknown ? never : T;
type JsStackScreenOptions = ExcludeFunction<NonNullable<ComponentProps<typeof JsStack>['screenOptions']>>;
type CardStyleInterpolator = NonNullable<JsStackScreenOptions['cardStyleInterpolator']>;
type TabSceneStyleInterpolator = NonNullable<BottomTabNavigationOptions['sceneStyleInterpolator']>;

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

const tabSceneStyleInterpolator: TabSceneStyleInterpolator = ({ current }) => ({
  sceneStyle: {
    opacity: current.progress.interpolate({
      inputRange: [-1, -0.5, 0, 0.5, 1],
      outputRange: [0, 0, 1, 0, 0],
      extrapolate: 'clamp',
    }),
    transform: [{
      scale: current.progress.interpolate({
        inputRange: [-1, -0.5, 0, 0.5, 1],
        outputRange: [0.98, 0.98, 1, 0.98, 0.98],
        extrapolate: 'clamp',
      }),
    }],
  },
});

export function getRouteScreenOptions(
  reducedMotion: boolean,
): JsStackScreenOptions {
  const sharedOptions: JsStackScreenOptions = {
    cardOverlayEnabled: false,
    cardStyle: { backgroundColor: 'transparent' },
    detachPreviousScreen: false,
    gestureEnabled: false,
    headerShown: false,
  };

  return reducedMotion
    ? { ...sharedOptions, animation: 'none' }
    : {
      ...sharedOptions,
      animation: 'default',
      animationTypeForReplace: 'push',
      cardStyleInterpolator: routeCardStyleInterpolator,
      transitionSpec,
    };
}

export function getTabScreenOptions(reducedMotion: boolean): BottomTabNavigationOptions {
  const sharedOptions: BottomTabNavigationOptions = {
    headerShown: false,
    lazy: true,
    sceneStyle: { backgroundColor: 'transparent' },
  };

  return reducedMotion
    ? { ...sharedOptions, animation: 'none' }
    : {
      ...sharedOptions,
      animation: 'fade',
      sceneStyleInterpolator: tabSceneStyleInterpolator,
      transitionSpec: timingTransition,
    };
}

export function getScopeTransitionScreenOptions(reducedMotion: boolean): JsStackScreenOptions {
  const options = getRouteScreenOptions(reducedMotion);
  return {
    ...options,
    cardShadowEnabled: false,
    detachPreviousScreen: true,
  };
}
