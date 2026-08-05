import { PAGE_TRANSITION_TIMING } from '@/constants/page-transition';
import { Animated } from 'react-native';
import {
  getRouteScreenOptions,
  getScopeTransitionScreenOptions,
} from '@/features/session/navigation/route-transition';
import { IOS_BACK_GESTURE_EDGE_WIDTH_PT } from '@/constants/back-navigation';

function readAnimatedNumber(value: unknown): number {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Expected an animated value object.');
  }

  const getValue = Reflect.get(value, '__getValue');
  if (typeof getValue !== 'function') {
    throw new Error('Expected the animated value to expose __getValue.');
  }

  const result = Reflect.apply(getValue, value, []);
  if (typeof result !== 'number') {
    throw new Error('Expected the animated value to resolve to a number.');
  }

  return result;
}

function readTranslateX(cardStyle: unknown): number {
  if (typeof cardStyle !== 'object' || cardStyle === null) {
    throw new Error('Expected a card style object.');
  }

  const transform = Reflect.get(cardStyle, 'transform');
  if (!Array.isArray(transform) || transform.length !== 1) {
    throw new Error('Expected exactly one card transform.');
  }

  const translation = transform[0];
  if (typeof translation !== 'object' || translation === null) {
    throw new Error('Expected a translateX transform.');
  }

  return readAnimatedNumber(Reflect.get(translation, 'translateX'));
}

describe('route transition', () => {
  it('disables route animation when reduced motion is enabled', () => {
    expect(getRouteScreenOptions(true)).toMatchObject({ animation: 'none' });
  });

  it('uses the shared fade-scale transition for navigation and replacement', () => {
    const screenOptions = getRouteScreenOptions(false);

    expect(typeof screenOptions.cardStyleInterpolator).toBe('function');
    expect(screenOptions).toMatchObject({
      animation: 'default',
      animationTypeForReplace: 'push',
      transitionSpec: {
        open: { config: { duration: PAGE_TRANSITION_TIMING.totalMs } },
        close: { config: { duration: PAGE_TRANSITION_TIMING.totalMs } },
      },
    });
  });

  it('enables only the iOS app-stack edge-back gesture', () => {
    expect(getRouteScreenOptions(false, {
      enableIosBackGesture: true,
      platform: 'ios',
    })).toMatchObject({
      gestureDirection: 'horizontal',
      gestureEnabled: true,
      gestureResponseDistance: IOS_BACK_GESTURE_EDGE_WIDTH_PT,
    });
    expect(getRouteScreenOptions(false, {
      enableIosBackGesture: true,
      platform: 'android',
    })).toMatchObject({
      gestureEnabled: false,
    });
    expect(getRouteScreenOptions(false, {
      enableIosBackGesture: true,
      platform: 'web',
    })).toMatchObject({
      gestureEnabled: false,
    });
  });

  it('uses the shared timing for the compact Dashboard and Settings scene push', () => {
    const screenOptions = getScopeTransitionScreenOptions(false, {
      platform: 'ios',
    });

    expect(typeof screenOptions.cardStyleInterpolator).toBe('function');
    expect(screenOptions).toMatchObject({
      animation: 'default',
      animationTypeForReplace: 'push',
      cardOverlayEnabled: false,
      cardShadowEnabled: false,
      detachPreviousScreen: false,
      gestureDirection: 'horizontal',
      gestureEnabled: true,
      gestureResponseDistance: IOS_BACK_GESTURE_EDGE_WIDTH_PT,
      transitionSpec: {
        open: { config: { duration: PAGE_TRANSITION_TIMING.totalMs } },
        close: { config: { duration: PAGE_TRANSITION_TIMING.totalMs } },
      },
    });

    const cardStyleInterpolator = screenOptions.cardStyleInterpolator;
    if (!cardStyleInterpolator) throw new Error('Expected a compact scope card interpolator.');

    const incomingProgressValue = new Animated.Value(0.5);
    const incomingProgress = incomingProgressValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const outgoingProgress = new Animated.Value(1).interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const nextProgressValue = new Animated.Value(0.5);
    const nextProgress = nextProgressValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const binaryProgress = new Animated.Value(0).interpolate<0 | 1>({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const directionValue = new Animated.Value(1);
    const direction = directionValue.interpolate<1 | -1>({
      inputRange: [0, 1],
      outputRange: [-1, 1],
    });
    const incomingStyle = cardStyleInterpolator({
      closing: binaryProgress,
      current: { progress: incomingProgress },
      index: 1,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
      inverted: direction,
      layouts: { screen: { width: 390, height: 844 } },
      swiping: binaryProgress,
    });
    const outgoingStyle = cardStyleInterpolator({
      closing: binaryProgress,
      current: { progress: outgoingProgress },
      index: 0,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
      inverted: direction,
      layouts: { screen: { width: 390, height: 844 } },
      next: { progress: nextProgress },
      swiping: binaryProgress,
    });

    expect(incomingStyle.cardStyle).not.toHaveProperty('backgroundColor');
    expect(incomingStyle.cardStyle).not.toHaveProperty('opacity');
    expect(outgoingStyle.cardStyle).not.toHaveProperty('backgroundColor');
    expect(outgoingStyle.cardStyle).not.toHaveProperty('opacity');
    expect(readTranslateX(incomingStyle.cardStyle)).toBe(195);
    expect(readTranslateX(outgoingStyle.cardStyle)).toBe(-195);

    incomingProgressValue.setValue(0);
    nextProgressValue.setValue(0);
    expect(readTranslateX(incomingStyle.cardStyle)).toBe(390);
    expect(readTranslateX(outgoingStyle.cardStyle)).toBe(0);

    incomingProgressValue.setValue(1);
    nextProgressValue.setValue(1);
    expect(readTranslateX(incomingStyle.cardStyle)).toBe(0);
    expect(readTranslateX(outgoingStyle.cardStyle)).toBe(-390);

    incomingProgressValue.setValue(0.5);
    nextProgressValue.setValue(0.5);
    directionValue.setValue(0);
    expect(readTranslateX(incomingStyle.cardStyle)).toBe(-195);
    expect(readTranslateX(outgoingStyle.cardStyle)).toBe(195);
  });

  it('disables compact scene motion and non-iOS gestures where required', () => {
    expect(getScopeTransitionScreenOptions(true, {
      platform: 'ios',
    })).toMatchObject({
      animation: 'none',
      cardStyle: { backgroundColor: 'transparent' },
      detachPreviousScreen: true,
      gestureEnabled: false,
    });
    expect(getScopeTransitionScreenOptions(false, {
      platform: 'android',
    })).toMatchObject({ gestureEnabled: false });
  });
});
