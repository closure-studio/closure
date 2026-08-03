import * as v from 'valibot';

import { acknowledgementsSchema } from './acknowledgement.schema';

const validAcknowledgements = {
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

describe('acknowledgementsSchema', () => {
  it('accepts complete acknowledgements data', () => {
    expect(v.safeParse(acknowledgementsSchema, validAcknowledgements).success).toBe(true);
  });

  it.each([
    { ...validAcknowledgements, operationsTeam: [] },
    { ...validAcknowledgements, recipient: { ...validAcknowledgements.recipient, avatarInitial: 'DR' } },
    { ...validAcknowledgements, specialThanks: validAcknowledgements.specialThanks.slice(0, 1) },
    { ...validAcknowledgements, operationsTeam: [{ id: 'unknown', name: '', avatarKey: 'missing' }] },
  ])('rejects empty or malformed acknowledgements data', (input) => {
    expect(v.safeParse(acknowledgementsSchema, input).success).toBe(false);
  });
});
