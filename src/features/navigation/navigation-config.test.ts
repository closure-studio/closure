import {
  dashboardSections,
  getMatrixReturnAction,
  getNavigationMode,
  navigationPages,
  shouldShowMobileBottomNavigation,
} from './navigation-config';

describe('navigation config', () => {
  it('keeps the root route in dashboard mode', () => {
    expect(getNavigationMode('/')).toBe('dashboard');
  });

  it.each(['/system', '/settings', '/records'] as const)('derives matrix mode for %s', (pathname) => {
    expect(getNavigationMode(pathname)).toBe('matrix');
  });

  it('returns through history only when the matrix was entered from dashboard', () => {
    expect(getMatrixReturnAction(true, true)).toEqual({ kind: 'back' });
    expect(getMatrixReturnAction(false, true)).toEqual({ kind: 'replace', route: '/' });
    expect(getMatrixReturnAction(true, false)).toEqual({ kind: 'replace', route: '/' });
  });

  it('hides mobile bottom navigation only on site settings', () => {
    expect(shouldShowMobileBottomNavigation('site')).toBe(false);
    expect(shouldShowMobileBottomNavigation('dashboard')).toBe(true);
    expect(shouldShowMobileBottomNavigation('system')).toBe(true);
    expect(shouldShowMobileBottomNavigation('records')).toBe(true);
  });

  it('defines the two mutually exclusive adaptive navigation sets', () => {
    expect(dashboardSections.map((section) => section.id)).toEqual([
      'overview',
      'operatorRoster',
      'materialInventory',
      'routineTasks',
      'activityTimeline',
    ]);
    expect(navigationPages.map(({ id, route }) => ({ id, route }))).toEqual([
      { id: 'dashboard', route: '/' },
      { id: 'system', route: '/system' },
      { id: 'site', route: '/settings' },
      { id: 'records', route: '/records' },
    ]);
  });
});
