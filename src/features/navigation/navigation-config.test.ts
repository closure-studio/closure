import { dashboardPageHref } from './navigation-config';

describe('Dashboard navigation config', () => {
  it('builds static Dashboard page paths', () => {
    expect(dashboardPageHref('operators')).toBe('/dashboard/operators');
  });
});
