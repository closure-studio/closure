import {
  registerHorizontalSwipeScope,
  selectActiveHorizontalSwipeScope,
  unregisterHorizontalSwipeScope,
} from './horizontal-swipe-registry';
import type { RegisteredHorizontalSwipeScope } from './horizontal-swipe-registry';

const onSwipe = () => undefined;
const settingsScope = {
  enabled: true,
  name: 'settings-navigation',
  onSwipe,
  registrationId: 1,
} satisfies RegisteredHorizontalSwipeScope;
const dashboardScope = {
  enabled: true,
  name: 'dashboard-account',
  onSwipe,
  registrationId: 2,
} satisfies RegisteredHorizontalSwipeScope;

describe('horizontal swipe scope registry', () => {
  it('selects the most recently registered scope', () => {
    const scopes = registerHorizontalSwipeScope(
      registerHorizontalSwipeScope([], settingsScope),
      dashboardScope,
    );

    expect(selectActiveHorizontalSwipeScope(scopes)).toBe(dashboardScope);
  });

  it('replaces a scope with the same name and preserves identity-safe cleanup', () => {
    const replacement = { ...settingsScope, registrationId: 3 };
    const scopes = registerHorizontalSwipeScope([settingsScope], replacement);
    const afterStaleCleanup = unregisterHorizontalSwipeScope(scopes, settingsScope.registrationId);

    expect(afterStaleCleanup).toEqual([replacement]);
  });

  it('returns no active scope after the current registration is removed', () => {
    const scopes = unregisterHorizontalSwipeScope([settingsScope], settingsScope.registrationId);

    expect(selectActiveHorizontalSwipeScope(scopes)).toBeNull();
  });
});
