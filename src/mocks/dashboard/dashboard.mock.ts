import * as v from 'valibot';

import { dashboardScheduleSchema } from '@/schemas/dashboard';

export const mockDashboardSchedule = v.parse(dashboardScheduleSchema, [
  { category: 'event', id: 'side-story-revival', status: 'active' },
  { category: 'banner', id: 'limited-headhunting', status: 'active' },
  { category: 'maintenance', id: 'version-maintenance', status: 'upcoming' },
  { category: 'event', id: 'contingency-contract', status: 'upcoming' },
  { category: 'notice', id: 'resource-rotation', status: 'ended' },
]);
