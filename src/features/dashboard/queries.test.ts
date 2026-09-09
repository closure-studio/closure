import * as v from 'valibot';

import { gameAccountSchema, type GameAccount } from '@/schemas/game-account';
import {
  arkHostQueryKeys,
  gameDetailQueryOptions,
  logsQueryOptions,
  findGameAccountById,
} from './queries';

const baseAccount: GameAccount = v.parse(gameAccountSchema, {
  account: 'BASE',
  ap: 0,
  avatar: { id: 'avatar_def_10', type: 'DEFAULT' },
  captchaInfo: {
    captcha_type: 'none',
    challenge: '',
    created: 0,
    geetestId: '',
    gt: '',
    riskType: '',
  },
  color: 'primary',
  config: {
    accelerate_slot: 'slot_14',
    account: 'BASE',
    allow_login_assist: false,
    battle_tasks: [],
    current_map: 'main_01-07',
    enable_building_arrange: false,
    is_auto_battle: false,
    keeping_ap: 0,
    operator_development_tasks: [],
    recruit_ignore_robot: false,
    recruit_reserve: 0,
  },
  createdAt: 0,
  isVerified: true,
  level: 1,
  nickname: 'Base',
  platform: 1,
  statusCode: 0,
  userId: 'user-1',
});

const accountA: GameAccount = { ...baseAccount, account: 'A' };
const accountB: GameAccount = { ...baseAccount, account: 'B' };

describe('arkHostQueryKeys', () => {
  it('scopes detail and logs queries per account', () => {
    expect(arkHostQueryKeys.detail('A')).not.toEqual(arkHostQueryKeys.detail('B'));
    expect(arkHostQueryKeys.logs('A')).not.toEqual(arkHostQueryKeys.logs('B'));
  });

  it('keeps the same account key stable across reads', () => {
    expect(arkHostQueryKeys.detail('A')).toEqual(arkHostQueryKeys.detail('A'));
    expect(arkHostQueryKeys.logs('A')).toEqual(arkHostQueryKeys.logs('A'));
  });

  it('scopes game accounts by user id', () => {
    expect(arkHostQueryKeys.gameAccounts('user-1')).not.toEqual(
      arkHostQueryKeys.gameAccounts('user-2'),
    );
  });
});

describe('account query option factories', () => {
  it('builds options whose query keys match the per-account scoping', () => {
    expect(gameDetailQueryOptions('A').queryKey).toEqual(arkHostQueryKeys.detail('A'));
    expect(logsQueryOptions('A').queryKey).toEqual(arkHostQueryKeys.logs('A'));
  });

  it('never produces a cross-account cache hit from the same factory', () => {
    expect(gameDetailQueryOptions('A').queryKey).not.toEqual(gameDetailQueryOptions('B').queryKey);
    expect(logsQueryOptions('A').queryKey).not.toEqual(logsQueryOptions('B').queryKey);
  });
});

describe('findGameAccountById', () => {
  it('returns null without an account id', () => {
    expect(findGameAccountById([accountA, accountB], null)).toBeNull();
    expect(findGameAccountById(undefined, null)).toBeNull();
  });

  it('returns null when the id is not in the account list', () => {
    expect(findGameAccountById([accountA], 'B')).toBeNull();
    expect(findGameAccountById(undefined, 'B')).toBeNull();
  });

  it('returns the account matching the selected id', () => {
    expect(findGameAccountById([accountA, accountB], 'B')).toBe(accountB);
  });
});
