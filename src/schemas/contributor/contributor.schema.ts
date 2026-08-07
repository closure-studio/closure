import * as v from 'valibot';

export const contributorAvatarKeySchema = v.picklist([
  'ooooooutdated',
  'fe-ame-lox',
  'kripto',
  'skadi',
  'gk',
]);

export const contributorSchema = v.object({
  id: v.picklist(['outdated', 'fe-ame-lox', 'kripto', 'skadi', 'gk']),
  name: v.pipe(v.string(), v.minLength(1)),
  avatarKey: contributorAvatarKeySchema,
});

export const contributorsSchema = v.object({
  recipient: v.object({
    gameAccountId: v.pipe(v.string(), v.minLength(1)),
    callsign: v.pipe(v.string(), v.minLength(1)),
  }),
  operationsTeam: v.pipe(v.array(contributorSchema), v.minLength(1)),
});

export type ContributorAvatarKey = v.InferOutput<typeof contributorAvatarKeySchema>;
export type Contributors = v.InferOutput<typeof contributorsSchema>;
