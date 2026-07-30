import type { ComponentProps } from 'react';
import { Stack as JsStack } from 'expo-router/js-stack';
import { Easing } from 'react-native';

type ExcludeFunction<T> = T extends (...args: never[]) => unknown ? never : T;
type JsStackScreenOptions = ExcludeFunction<NonNullable<ComponentProps<typeof JsStack>['screenOptions']>>;
type CardStyleInterpolator = NonNullable<JsStackScreenOptions['cardStyleInterpolator']>;

const TRANSITION_PHASE_DURATION_MS = 500;

const timingTransition = {
  animation: 'timing',
  config: {
    duration: TRANSITION_PHASE_DURATION_MS * 2,
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

export function getRouteScreenOptions(reducedMotion: boolean): JsStackScreenOptions {
  const sharedOptions: JsStackScreenOptions = {
    cardOverlayEnabled: false,
    cardStyle: { backgroundColor: 'transparent' },
    detachPreviousScreen: false,
    gestureEnabled: false,
    headerShown: false,
  };

  if (reducedMotion) return { ...sharedOptions, animation: 'none' };

  return {
    ...sharedOptions,
    animation: 'default',
    animationTypeForReplace: 'push',
    cardStyleInterpolator: routeCardStyleInterpolator,
    transitionSpec,
  };
}
