import {
  dashboardNavigation,
  getNavigationScope,
  settingsNavigation,
} from './navigation-config';

describe('navigation config', () => {
  it.each(['/', '/dashboard', '/dashboard/overview', '/dashboard/operators'] as const)(
    'derives dashboard scope for %s',
    (pathname) => {
      expect(getNavigationScope(pathname)).toBe('dashboard');
    },
  );

  it.each(['/settings', '/settings/site', '/settings/system', '/settings/recordings'] as const)(
    'derives settings scope for %s',
    (pathname) => {
      expect(getNavigationScope(pathname)).toBe('settings');
    },
  );

  it('defines the canonical scope destinations', () => {
    expect(dashboardNavigation.defaultPage).toMatchObject({
      id: 'overview',
      route: '/dashboard/overview',
    });
    expect(settingsNavigation.defaultPage).toMatchObject({
      id: 'site',
      route: '/settings/site',
    });
    expect(dashboardNavigation.pages.overview).toBe(dashboardNavigation.defaultPage);
    expect(settingsNavigation.pages.site).toBe(settingsNavigation.defaultPage);
  });

  it('defines the two mutually exclusive adaptive navigation sets', () => {
    const dashboardPages = Object.values(dashboardNavigation.pages).sort((left, right) => left.sort - right.sort);
    const settingsPages = Object.values(settingsNavigation.pages).sort((left, right) => left.sort - right.sort);

    expect(dashboardPages.map(({ id, route }) => ({ id, route }))).toEqual([
      { id: 'overview', route: '/dashboard/overview' },
      { id: 'operators', route: '/dashboard/operators' },
      { id: 'inventory', route: '/dashboard/inventory' },
      { id: 'tasks', route: '/dashboard/tasks' },
      { id: 'activity', route: '/dashboard/activity' },
    ]);
    expect(settingsPages.map(({ id, route }) => ({ id, route }))).toEqual([
      { id: 'system', route: '/settings/system' },
      { id: 'site', route: '/settings/site' },
      { id: 'recordings', route: '/settings/recordings' },
    ]);
  });
});
