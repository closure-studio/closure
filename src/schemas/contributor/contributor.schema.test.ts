import * as v from 'valibot';

import { contributorsSchema } from './contributor.schema';

const validContributors = {
  recipient: {
    gameAccountId: 'acc-01',
    callsign: 'AMIYA-MAIN',
  },
  operationsTeam: [
    { id: 'outdated', name: 'Ooooooutdated', avatarKey: 'ooooooutdated' },
  ],
} as const;

describe('contributorsSchema', () => {
  it('accepts complete contributors data', () => {
    expect(v.safeParse(contributorsSchema, validContributors).success).toBe(true);
  });

  it.each([
    { ...validContributors, operationsTeam: [] },
    { ...validContributors, recipient: { ...validContributors.recipient, callsign: '' } },
    { ...validContributors, operationsTeam: [{ id: 'unknown', name: '', avatarKey: 'missing' }] },
  ])('rejects empty or malformed contributors data', (input) => {
    expect(v.safeParse(contributorsSchema, input).success).toBe(false);
  });
});
