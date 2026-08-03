import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { PropsWithChildren, ReactElement } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import {
  registerHorizontalSwipeScope,
  selectActiveHorizontalSwipeScope,
  unregisterHorizontalSwipeScope,
} from './horizontal-swipe-registry';
import type {
  HorizontalSwipeScopeConfiguration,
  RegisteredHorizontalSwipeScope,
} from './horizontal-swipe-registry';

export const HORIZONTAL_SWIPE_THRESHOLD_PT = 40;

export type HorizontalSwipeDirection = 'left' | 'right';

type HorizontalSwipeContextValue = {
  activeScope: RegisteredHorizontalSwipeScope | null;
  registerScope: (configuration: HorizontalSwipeScopeConfiguration) => () => void;
};

const HorizontalSwipeContext = createContext<HorizontalSwipeContextValue | null>(null);

function useHorizontalSwipeContext() {
  const context = use(HorizontalSwipeContext);
  if (!context) {
    throw new Error('Horizontal swipe components must be rendered within HorizontalSwipeProvider.');
  }

  return context;
}

export function resolveHorizontalSwipeDirection({
  translationX,
  translationY,
}: {
  translationX: number;
  translationY: number;
}): HorizontalSwipeDirection | null {
  const horizontalDistance = Math.abs(translationX);
  if (horizontalDistance < HORIZONTAL_SWIPE_THRESHOLD_PT || horizontalDistance <= Math.abs(translationY)) {
    return null;
  }

  return translationX < 0 ? 'left' : 'right';
}

export function resolveHorizontalSwipeEnabled({
  scopeEnabled,
  surfaceEnabled,
}: {
  scopeEnabled: boolean | undefined;
  surfaceEnabled: boolean;
}) {
  return Boolean(scopeEnabled && surfaceEnabled);
}

export function HorizontalSwipeProvider({ children }: PropsWithChildren) {
  const nextRegistrationId = useRef(0);
  const [registeredScopes, setRegisteredScopes] = useState<RegisteredHorizontalSwipeScope[]>([]);
  const activeScope = selectActiveHorizontalSwipeScope(registeredScopes);
  const activeScopeNames = registeredScopes.map((scope) => scope.name).join(', ');

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && registeredScopes.length > 1) {
      console.warn(`Multiple horizontal swipe scopes are active: ${activeScopeNames}. The most recently activated scope will receive gestures.`);
    }
  }, [activeScopeNames, registeredScopes.length]);

  const registerScope = useCallback((configuration: HorizontalSwipeScopeConfiguration) => {
    nextRegistrationId.current += 1;
    const registration = {
      ...configuration,
      registrationId: nextRegistrationId.current,
    };
    setRegisteredScopes((currentScopes) => registerHorizontalSwipeScope(currentScopes, registration));

    return () => {
      setRegisteredScopes((currentScopes) => unregisterHorizontalSwipeScope(
        currentScopes,
        registration.registrationId,
      ));
    };
  }, []);

  const contextValue = useMemo(
    () => ({ activeScope, registerScope }),
    [activeScope, registerScope],
  );

  return (
    <HorizontalSwipeContext value={contextValue}>
      {children}
    </HorizontalSwipeContext>
  );
}

export function HorizontalSwipeScope({
  active,
  enabled,
  name,
  onSwipe,
}: HorizontalSwipeScopeConfiguration & { active: boolean }) {
  const { registerScope } = useHorizontalSwipeContext();

  useEffect(() => {
    if (!active) return undefined;
    return registerScope({ enabled, name, onSwipe });
  }, [active, enabled, name, onSwipe, registerScope]);

  return null;
}

export function HorizontalSwipeSurface({
  children,
  enabled = true,
}: {
  children: ReactElement;
  enabled?: boolean;
}) {
  const { activeScope } = useHorizontalSwipeContext();
  const isEnabled = resolveHorizontalSwipeEnabled({
    scopeEnabled: activeScope?.enabled,
    surfaceEnabled: enabled,
  });
  const panGesture = useMemo(
    () => Gesture.Pan()
      .enabled(isEnabled)
      .activeOffsetX([-HORIZONTAL_SWIPE_THRESHOLD_PT, HORIZONTAL_SWIPE_THRESHOLD_PT])
      .failOffsetY([-HORIZONTAL_SWIPE_THRESHOLD_PT, HORIZONTAL_SWIPE_THRESHOLD_PT])
      .cancelsTouchesInView(false)
      .runOnJS(true)
      .onEnd(({ translationX, translationY }) => {
        const direction = resolveHorizontalSwipeDirection({ translationX, translationY });
        if (direction) activeScope?.onSwipe(direction);
      }),
    [activeScope, isEnabled],
  );

  return (
    <GestureDetector
      gesture={panGesture}
      touchAction={isEnabled ? 'pan-y' : 'auto'}
    >
      {children}
    </GestureDetector>
  );
}
