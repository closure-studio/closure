import {
  dashboardPageHref,
  dashboardNavigation,
  getDashboardPageId,
  getSettingsPageId,
  settingsNavigation,
} from './navigation-config';

describe('navigation config', () => {
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

  it('creates page hrefs with account search params and derives the active page', () => {
    expect(dashboardPageHref('overview', 'G1')).toEqual({
      pathname: '/dashboard/overview',
      params: { gameAccountId: 'G1' },
    });
    expect(getDashboardPageId('/dashboard/inventory')).toBe('inventory');
    expect(getDashboardPageId('/dashboard/unknown')).toBeNull();
    expect(getSettingsPageId('/settings/account')).toBe('account');
    expect(getSettingsPageId('/settings/unknown')).toBeNull();
  });
});
