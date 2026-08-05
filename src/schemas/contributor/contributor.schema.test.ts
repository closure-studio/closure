import * as v from 'valibot';

import { contributorsSchema } from './contributor.schema';

const validContributors = {
  recipient: {
    gameAccountId: 'acc-01',
    callsign: 'AMIYA-MAIN',
    avatarInitial: 'A',
  },
  operationsTeam: [
    { id: 'outdated', name: 'Ooooooutdated', avatarKey: 'ooooooutdated' },
  ],
  specialThanks: [
    { id: 'vibe-coding', name: '黑与白公益站' },
    { id: 'design', name: '欧阳淇淇' },
  ],
} as const;

describe('contributorsSchema', () => {
  it('accepts complete contributors data', () => {
    expect(v.safeParse(contributorsSchema, validContributors).success).toBe(true);
  });

  it.each([
    { ...validContributors, operationsTeam: [] },
    { ...validContributors, recipient: { ...validContributors.recipient, avatarInitial: 'DR' } },
    { ...validContributors, specialThanks: validContributors.specialThanks.slice(0, 1) },
    { ...validContributors, operationsTeam: [{ id: 'unknown', name: '', avatarKey: 'missing' }] },
  ])('rejects empty or malformed contributors data', (input) => {
    expect(v.safeParse(contributorsSchema, input).success).toBe(false);
  });
});
