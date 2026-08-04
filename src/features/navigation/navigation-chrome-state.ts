import { useEffect, useState } from 'react';

import { PAGE_TRANSITION_TIMING } from '@/constants/page-transition';
import type { NavigationScope } from './navigation-config';

export function resolveNavigationChromeVisibility({
  isCompact,
  scope,
  settledScope,
}: {
  isCompact: boolean;
  scope: NavigationScope;
  settledScope: NavigationScope;
}) {
  const isChromeSettled = settledScope === scope;
  const isDashboardChromeVisible = isChromeSettled && scope === 'dashboard';

  return {
    isDashboardChromeVisible,
    isNavigationHeaderVisible: !isCompact || isDashboardChromeVisible,
    // The routed page mounts as soon as the pathname changes, one commit before the
    // card transition owns its opacity. Gating it on the same clock as the chrome keeps
    // the incoming scope from painting a frame at full opacity before the swap starts.
    isScopeContentVisible: isChromeSettled,
    isSettingsChromeVisible: isChromeSettled && scope === 'settings',
  } as const;
}

export function useSettledNavigationScope(scope: NavigationScope, reducedMotion: boolean) {
  const [settledScope, setSettledScope] = useState<NavigationScope>(scope);

  // Reduced motion has no exit phase to wait on, so the scope settles during render rather
  // than from an effect. React discards this pass and re-renders before committing, so the
  // chrome never paints the stale scope, and the state stays current if motion returns.
  if (reducedMotion && settledScope !== scope) {
    setSettledScope(scope);
  }

  useEffect(() => {
    if (reducedMotion || settledScope === scope) return undefined;

    const chromeSwapTimer = setTimeout(() => {
      setSettledScope(scope);
    }, PAGE_TRANSITION_TIMING.phaseMs);

    return () => clearTimeout(chromeSwapTimer);
  }, [reducedMotion, scope, settledScope]);

  return settledScope;
}
