import { PAGE_TRANSITION_TIMING } from '@/constants/page-transition';
import {
  getRouteScreenOptions,
  getScopeTransitionScreenOptions,
} from '@/features/session/navigation/route-transition';
import { IOS_BACK_GESTURE_EDGE_WIDTH_PT } from '@/constants/back-navigation';

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
      cardBackgroundColor: '#001018',
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
  });

  it('disables compact scene motion and non-iOS gestures where required', () => {
    expect(getScopeTransitionScreenOptions(true, {
      cardBackgroundColor: '#001018',
      platform: 'ios',
    })).toMatchObject({
      animation: 'none',
      cardStyle: { backgroundColor: 'transparent' },
      detachPreviousScreen: true,
      gestureEnabled: false,
    });
    expect(getScopeTransitionScreenOptions(false, {
      cardBackgroundColor: '#001018',
      platform: 'android',
    })).toMatchObject({ gestureEnabled: false });
  });
});
