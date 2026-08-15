import type { Contributors } from '@/schemas/contributor';

export const contributorsContent = {
  recipient: {
    callsign: 'AMIYA-MAIN',
  },
  operationsTeam: [
    { id: 'outdated', name: 'Ooooooutdated', avatarKey: 'ooooooutdated' },
    { id: 'fe-ame-lox', name: 'Fe∞AmeLox', avatarKey: 'fe-ame-lox' },
    { id: 'kripto', name: 'oʇdı̣ɹꓘ', avatarKey: 'kripto' },
    { id: 'skadi', name: 'Skadi', avatarKey: 'skadi' },
    { id: 'gk', name: '神算子GK', avatarKey: 'gk' },
  ],
} satisfies Contributors;
