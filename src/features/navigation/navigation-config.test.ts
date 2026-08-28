import { dashboardPageHref } from './navigation-config';

describe('Dashboard navigation config', () => {
  it('builds account-scoped Dashboard paths', () => {
    expect(dashboardPageHref('operators', 'G1')).toBe('/dashboard/G1/operators');
  });
});
