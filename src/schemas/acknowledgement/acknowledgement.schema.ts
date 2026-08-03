import * as v from 'valibot';

export const acknowledgementAvatarKeySchema = v.picklist([
  'ooooooutdated',
  'fe-ame-lox',
  'kripto',
  'skadi',
  'gk',
]);

export const acknowledgementContributorSchema = v.object({
  id: v.picklist(['outdated', 'fe-ame-lox', 'kripto', 'skadi', 'gk']),
  name: v.pipe(v.string(), v.minLength(1)),
  avatarKey: acknowledgementAvatarKeySchema,
});

export const acknowledgementCreditSchema = v.object({
  id: v.picklist(['vibe-coding', 'design']),
  name: v.pipe(v.string(), v.minLength(1)),
});

export const acknowledgementsSchema = v.object({
  recipient: v.object({
    gameAccountId: v.pipe(v.string(), v.minLength(1)),
    callsign: v.pipe(v.string(), v.minLength(1)),
    avatarInitial: v.pipe(v.string(), v.length(1)),
  }),
  operationsTeam: v.pipe(v.array(acknowledgementContributorSchema), v.minLength(1)),
  specialThanks: v.pipe(v.array(acknowledgementCreditSchema), v.length(2)),
});

export type AcknowledgementAvatarKey = v.InferOutput<typeof acknowledgementAvatarKeySchema>;
export type Acknowledgements = v.InferOutput<typeof acknowledgementsSchema>;
