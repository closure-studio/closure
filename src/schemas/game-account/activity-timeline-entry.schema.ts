import * as v from 'valibot';

const activityTimelineCategorySchema = v.picklist(['event', 'banner', 'maintenance', 'notice']);
const activityTimelineStatusSchema = v.picklist(['active', 'upcoming', 'ended']);

export const activityTimelineEntrySchema = v.object({
  id: v.string(),
  scheduleLabel: v.string(),
  title: v.string(),
  tag: v.string(),
  category: activityTimelineCategorySchema,
  status: activityTimelineStatusSchema,
  description: v.string(),
});

export type ActivityTimelineEntry = v.InferOutput<typeof activityTimelineEntrySchema>;
