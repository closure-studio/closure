import * as v from 'valibot';

import { mockDashboardSchedule } from '@/mocks/dashboard';
import {
  dashboardScheduleEntrySchema,
  dashboardScheduleSchema,
} from '.';

describe('Dashboard schedule schema', () => {
  it('accepts the restored schedule fixture', () => {
    expect(v.safeParse(dashboardScheduleSchema, mockDashboardSchedule).success).toBe(true);
  });

  it.each([
    { category: 'unknown', id: 'entry-1', status: 'active' },
    { category: 'event', id: '', status: 'active' },
    { category: 'event', id: 'entry-1', status: 'unknown' },
  ])('rejects malformed schedule entries', (entry) => {
    expect(v.safeParse(dashboardScheduleEntrySchema, entry).success).toBe(false);
  });
});
