import {
  dashboardPageHref,
  getDashboardPageId,
} from './navigation-config';

describe('Dashboard navigation config', () => {
  it('builds account-scoped Dashboard paths', () => {
    expect(dashboardPageHref('operators', 'G1')).toEqual({
      pathname: '/dashboard/[gameAccountId]/operators',
      params: { gameAccountId: 'G1' },
    });
  });

  it('reads the active page only from account-scoped Dashboard paths', () => {
    expect(getDashboardPageId('/dashboard/G1/overview')).toBe('overview');
    expect(getDashboardPageId('/dashboard/G2/activity')).toBe('activity');
    expect(getDashboardPageId('/dashboard/overview')).toBeNull();
    expect(getDashboardPageId('/settings/account')).toBeNull();
  });
});
