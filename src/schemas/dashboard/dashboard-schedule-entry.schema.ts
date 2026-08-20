import * as v from 'valibot';

const dashboardScheduleCategorySchema = v.picklist([
  'event',
  'banner',
  'maintenance',
  'notice',
]);
const dashboardScheduleIdSchema = v.picklist([
  'side-story-revival',
  'limited-headhunting',
  'version-maintenance',
  'contingency-contract',
  'resource-rotation',
]);
const dashboardScheduleStatusSchema = v.picklist([
  'active',
  'upcoming',
  'ended',
]);

export const dashboardScheduleEntrySchema = v.object({
  category: dashboardScheduleCategorySchema,
  id: dashboardScheduleIdSchema,
  status: dashboardScheduleStatusSchema,
});

export const dashboardScheduleSchema = v.array(dashboardScheduleEntrySchema);

export type DashboardScheduleEntry = v.InferOutput<typeof dashboardScheduleEntrySchema>;
