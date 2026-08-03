import type { HorizontalSwipeDirection } from './horizontal-swipe-context';

export type HorizontalSwipeScopeConfiguration = {
  enabled: boolean;
  name: string;
  onSwipe: (direction: HorizontalSwipeDirection) => void;
};

export type RegisteredHorizontalSwipeScope = HorizontalSwipeScopeConfiguration & {
  registrationId: number;
};

export function registerHorizontalSwipeScope(
  scopes: readonly RegisteredHorizontalSwipeScope[],
  registration: RegisteredHorizontalSwipeScope,
) {
  return [
    ...scopes.filter((scope) => scope.name !== registration.name),
    registration,
  ];
}

export function unregisterHorizontalSwipeScope(
  scopes: readonly RegisteredHorizontalSwipeScope[],
  registrationId: number,
) {
  return scopes.filter((scope) => scope.registrationId !== registrationId);
}

export function selectActiveHorizontalSwipeScope(scopes: readonly RegisteredHorizontalSwipeScope[]) {
  return scopes.at(-1) ?? null;
}
