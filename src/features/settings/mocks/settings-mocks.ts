import type { ApiNode } from '@/schemas/api-node';
import type { Contributors } from '@/schemas/contributor';
import type { UserAccount } from '@/schemas/user-account';

export const mockApiNodes = [
  {
    id: 'domestic',
    description: 'LTSC API Server',
    mockLatencyMs: 48,
    outcome: 'reachable',
  },
  {
    id: 'overseas',
    description: 'Cloudflare API Server',
    mockLatencyMs: 126,
    outcome: 'reachable',
  },
] satisfies [ApiNode, ApiNode];

export const mockFailedApiNode = {
  id: 'overseas',
  description: 'Cloudflare API Server',
  mockLatencyMs: 0,
  outcome: 'unreachable',
} satisfies ApiNode;

export const mockUserAccount = {
  id: 'user-closure-01',
  email: 'doctor@rhodes.is',
  registeredAt: '2025-01-14T08:30:00.000Z',
  role: 'member',
} satisfies UserAccount;

export const mockContributors = {
  recipient: {
    gameAccountId: 'acc-01',
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
