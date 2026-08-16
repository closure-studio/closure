import type { ComponentProps } from 'react';
import { Stack as JsStack } from 'expo-router/js-stack';
import type { BottomTabNavigationOptions } from 'expo-router/tabs';
import { Animated, Easing } from 'react-native';

import { PAGE_TRANSITION_DURATION_MS } from '@/constants/routes';

type ExcludeFunction<T> = T extends (...args: never[]) => unknown ? never : T;
type JsStackScreenOptions = ExcludeFunction<NonNullable<ComponentProps<typeof JsStack>['screenOptions']>>;
type CardStyleInterpolator = NonNullable<JsStackScreenOptions['cardStyleInterpolator']>;
type TabSceneStyleInterpolator = NonNullable<BottomTabNavigationOptions['sceneStyleInterpolator']>;

const timingTransition = {
  animation: 'timing',
  config: {
    duration: PAGE_TRANSITION_DURATION_MS,
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

const scopeCardStyleInterpolator: CardStyleInterpolator = ({ current, inverted, layouts, next }) => {
  const translation = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -layouts.screen.width],
        extrapolate: 'clamp',
      })
    : current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [layouts.screen.width, 0],
        extrapolate: 'clamp',
      });

  return {
    cardStyle: {
      transform: [{ translateX: Animated.multiply(translation, inverted) }],
    },
  };
};

const sharedStackOptions = {
  cardOverlayEnabled: false,
  cardStyle: { backgroundColor: 'transparent' },
  gestureEnabled: false,
  headerShown: false,
} as const;

type StackOptionsExtras = {
  cardShadowEnabled?: boolean;
  detachPreviousScreen?: boolean;
};

function buildStackOptions(
  reducedMotion: boolean,
  interpolator: CardStyleInterpolator,
  extras: StackOptionsExtras = {},
): JsStackScreenOptions {
  const base = {
    ...sharedStackOptions,
    detachPreviousScreen: extras.detachPreviousScreen ?? false,
    ...(extras.cardShadowEnabled === undefined ? {} : { cardShadowEnabled: extras.cardShadowEnabled }),
  };

  return reducedMotion
    ? { ...base, animation: 'none' }
    : {
      ...base,
      animation: 'default',
      animationTypeForReplace: 'push',
      cardStyleInterpolator: interpolator,
      transitionSpec,
    };
}

export function getRouteScreenOptions(
  reducedMotion: boolean,
): JsStackScreenOptions {
  return buildStackOptions(reducedMotion, routeCardStyleInterpolator, {
    detachPreviousScreen: false,
  });
}

export function getTabScreenOptions(reducedMotion: boolean): BottomTabNavigationOptions {
  const sharedOptions: BottomTabNavigationOptions = {
    headerShown: false,
    lazy: true,
    freezeOnBlur: true,
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

export function getScopeTransitionScreenOptions(
  reducedMotion: boolean,
): JsStackScreenOptions {
  return buildStackOptions(reducedMotion, scopeCardStyleInterpolator, {
    cardShadowEnabled: false,
    detachPreviousScreen: reducedMotion,
  });
}
