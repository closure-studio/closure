import {
  dashboardPageHref,
  dashboardNavigation,
  getDashboardPageId,
  getNavigationScope,
  settingsNavigation,
} from './navigation-config';

describe('navigation config', () => {
  it.each(['/', '/dashboard', '/dashboard/G1/overview', '/dashboard/G1/settings', '/dashboard/G1/operators'] as const)(
    'derives dashboard scope for %s',
    (pathname) => {
      expect(getNavigationScope(pathname)).toBe('dashboard');
    },
  );

  it.each(['/settings', '/settings/network', '/settings/account', '/settings/contributors'] as const)(
    'derives settings scope for %s',
    (pathname) => {
      expect(getNavigationScope(pathname)).toBe('settings');
    },
  );

  it('defines the canonical scope destinations', () => {
    expect(dashboardNavigation.defaultPage).toMatchObject({
      id: 'overview',
      segment: 'overview',
    });
    expect(settingsNavigation.defaultPage).toMatchObject({
      id: 'network',
      route: '/settings/network',
    });
    expect(dashboardNavigation.pages.overview).toBe(dashboardNavigation.defaultPage);
    expect(settingsNavigation.pages.network).toBe(settingsNavigation.defaultPage);
  });

  it('defines the two mutually exclusive adaptive navigation sets', () => {
    const dashboardPages = Object.values(dashboardNavigation.pages).sort((left, right) => left.sort - right.sort);
    const settingsPages = Object.values(settingsNavigation.pages).sort((left, right) => left.sort - right.sort);

    expect(dashboardPages.map(({ id, segment }) => ({ id, segment }))).toEqual([
      { id: 'overview', segment: 'overview' },
      { id: 'settings', segment: 'settings' },
      { id: 'operators', segment: 'operators' },
      { id: 'inventory', segment: 'inventory' },
      { id: 'activity', segment: 'activity' },
    ]);
    expect(settingsPages.map(({ id, route }) => ({ id, route }))).toEqual([
      { id: 'network', route: '/settings/network' },
      { id: 'account', route: '/settings/account' },
      { id: 'contributors', route: '/settings/contributors' },
    ]);
  });

  it('creates account-scoped hrefs and derives the active page from the URL', () => {
    expect(dashboardPageHref('overview', 'G1')).toEqual({
      pathname: '/dashboard/[gameAccountId]/overview',
      params: { gameAccountId: 'G1' },
    });
    expect(getDashboardPageId('/dashboard/G1/inventory')).toBe('inventory');
    expect(getDashboardPageId('/dashboard/G1/unknown')).toBeNull();
  });
});
