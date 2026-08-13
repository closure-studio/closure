import * as v from 'valibot';

import {
  mockArkHostApCostResponse,
  mockArkHostGameListResponse,
  mockArkHostSystemConfigResponse,
} from '@/mocks/arkhost';
import { persistedAppStateSchema } from './local-state.schema';

if (mockArkHostGameListResponse.code !== 1 || mockArkHostApCostResponse.code !== 1 || mockArkHostSystemConfigResponse.code !== 1) {
  throw new Error('Expected successful ArkHost fixtures.');
}
const gameAccounts = mockArkHostGameListResponse.data.map((entry) => ({
  account: entry.status.account, ap: entry.status.ap, avatar: entry.status.avatar, captchaInfo: entry.captcha_info,
  color: 'primary' as const, config: entry.game_config, createdAt: entry.status.created_at,
  isVerified: entry.status.is_verify, level: entry.status.level, nickname: entry.status.nick_name,
  platform: entry.status.platform, statusCode: entry.status.code, statusText: entry.status.text, userId: entry.status.uuid,
}));
const games = {
  activeGameAccountId: gameAccounts[0]?.account ?? null,
  apCostRanking: mockArkHostApCostResponse.data,
  charactersByAccount: {}, detailsByAccount: {}, gameAccounts, gachaEvents: [], logsByAccount: {},
  ownerUserId: 'user-1', systemConfig: mockArkHostSystemConfigResponse.data,
};

describe('persistedAppStateSchema', () => {
  it('accepts signed-out state and complete ArkHost snapshot', () => {
    expect(v.safeParse(persistedAppStateSchema, {
      auth: { session: null },
      games: null,
      network: { selectedApiNodeId: 'domestic' },
    }).success).toBe(true);
    expect(v.safeParse(persistedAppStateSchema, {
      auth: { session: null },
      games,
      network: { selectedApiNodeId: 'domestic' },
    }).success).toBe(true);
  });
  it('rejects active IDs outside the ArkHost account collection', () => {
    expect(v.safeParse(persistedAppStateSchema, {
      auth: { session: null },
      games: { ...games, activeGameAccountId: 'missing' },
      network: { selectedApiNodeId: 'domestic' },
    }).success).toBe(false);
  });
  it('rejects malformed nested ArkHost data', () => {
    expect(v.safeParse(persistedAppStateSchema, {
      auth: { session: null },
      games: { ...games, gameAccounts: [{ ...gameAccounts[0], ap: -1 }] },
      network: { selectedApiNodeId: 'domestic' },
    }).success).toBe(false);
  });
});
