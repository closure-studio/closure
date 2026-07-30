import * as v from 'valibot';

const routineTaskCadenceSchema = v.picklist(['日常', '周常']);

export const routineTaskSchema = v.pipe(
  v.object({
    id: v.string(),
    label: v.string(),
    reward: v.string(),
    isCompleted: v.boolean(),
    cadence: routineTaskCadenceSchema,
    completionProgress: v.tuple([v.number(), v.number()]),
  }),
  v.check(({ completionProgress: [current, target] }) => current <= target),
  v.check(({ completionProgress: [current, target], isCompleted }) => isCompleted === (current >= target)),
);

export type RoutineTask = v.InferOutput<typeof routineTaskSchema>;
