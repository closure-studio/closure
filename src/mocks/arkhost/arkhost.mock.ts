import * as v from 'valibot';

import rawCharacterTable from '@/assets/data/character_table.json';
import {
  arkHostGameDetailResponseSchema,
  arkHostGameDetailSchema,
  arkHostGameListResponseSchema,
  arkHostGameLogsResponseSchema,
  arkHostGachaEventSchema,
  type ArkHostGameConfig,
  type ArkHostGameListEntry,
} from '@/schemas/arkhost';
import { characterTableSchema } from '@/schemas/game-data';

const MOCK_USER_ID = 'mock-user';
const MOCK_ACCOUNTS = ['G00000000001', 'G00000000002', 'G00000000003'] as const;
const MOCK_OPERATOR_COUNT = 20;
const MOCK_SIX_STAR_CHARACTER_IDS = Object.entries(
  v.parse(characterTableSchema, rawCharacterTable),
)
  .filter(([, character]) => character.rarity === 5)
  .map(([characterId]) => characterId);

if (MOCK_SIX_STAR_CHARACTER_IDS.length < MOCK_OPERATOR_COUNT * MOCK_ACCOUNTS.length) {
  throw new Error('The bundled character table does not contain enough six-star mock operators.');
}

function createMockTroopCharacters(accountIndex: number) {
  const start = accountIndex * MOCK_OPERATOR_COUNT;
  return Object.fromEntries(
    MOCK_SIX_STAR_CHARACTER_IDS
      .slice(start, start + MOCK_OPERATOR_COUNT)
      .map((charId, operatorIndex) => [
        `operator-${accountIndex + 1}-${operatorIndex + 1}`,
        {
          charId,
          evolvePhase: 2,
          level: 80,
          potentialRank: operatorIndex % 6,
          skills: [1, 2, 3].map((skillIndex) => ({
            skillId: `${charId}_skill_${skillIndex}`,
            specializeLevel: 0,
            unlock: true,
          })),
        },
      ]),
  );
}

const captchaInfo = {
  account: '',
  captcha_type: '',
  challenge: '',
  created: 0,
  geetestId: '',
  gt: '',
  riskType: '',
};

function gameConfig(account: string, currentMap = ''): ArkHostGameConfig {
  return {
    accelerate_slot: 'slot_14',
    account,
    allow_login_assist: false,
    battle_tasks: [{ mode: 'LOOP', stage_id: currentMap || 'main_01-07' }],
    current_map: currentMap,
    enable_building_arrange: true,
    is_auto_battle: true,
    keeping_ap: 0,
    operator_development_tasks: [],
    recruit_ignore_robot: false,
    recruit_reserve: 0,
  };
}

const accountFixtures = MOCK_ACCOUNTS.map((account, index) => ({
  captcha_info: captchaInfo,
  game_config: gameConfig(account, index === 0 ? 'main_01-07' : ''),
  status: {
    account,
    ap: 20 + index * 10,
    avatar: index === 0
      ? { id: 'avatar_def_01', type: 'DEFAULT' }
      : { id: '', type: '' },
    code: 2,
    created_at: 1_700_000_000 + index,
    is_verify: true,
    level: 10 + index,
    nick_name: `Mock Doctor ${index + 1}`,
    password: '******',
    platform: 1,
    uuid: MOCK_USER_ID,
  },
} satisfies ArkHostGameListEntry));

export const mockArkHostGameListResponse = v.parse(
  arkHostGameListResponseSchema,
  { code: 1, data: accountFixtures, message: 'ok' },
);

function gameDetail(entry: ArkHostGameListEntry, index: number) {
  return v.parse(arkHostGameDetailSchema, {
    building: index === 0
      ? {
          rooms: {
            MANUFACTURE: {
              slot_6: { formulaId: '3' },
              slot_14: { formulaId: '3' },
              slot_15: { formulaId: '4' },
              slot_16: { formulaId: '4' },
              slot_25: { formulaId: '4' },
            },
            TRADING: {
              slot_5: { strategy: 'O_GOLD' },
              slot_7: { strategy: 'O_GOLD' },
            },
            TRAINING: {
              slot_13: {
                completeWorkTime: '',
                trainee: { charId: 'char_002_amiya', skillId: '' },
              },
            },
          },
        }
      : null,
    config: entry.game_config,
    consumable: null,
    inventory: index === 0 ? { '31034': 12, EPGS_COIN: 24 } : null,
    lastFreshTs: 0,
    screenshot: null,
    status: {
      androidDiamond: 0,
      ap: entry.status.ap,
      avatar: entry.status.avatar,
      avatarId: '',
      diamondShard: 0,
      gachaTicket: 0,
      gold: 1000,
      lastApAddTime: 0,
      level: entry.status.level,
      maxAp: 100,
      nickName: entry.status.nick_name,
      recruitLicense: 0,
      secretary: 'char_002_amiya',
      secretarySkinId: '',
      socialPoint: 0,
      tenGachaTicket: 0,
    },
    troop: {
      chars: createMockTroopCharacters(index),
    },
  });
}

export const mockArkHostGameDetails = accountFixtures.map(gameDetail);

export const mockArkHostGameDetailResponse = v.parse(
  arkHostGameDetailResponseSchema,
  { code: 1, data: mockArkHostGameDetails[0], message: 'ok' },
);

export const mockArkHostGameLogsResponse = v.parse(
  arkHostGameLogsResponseSchema,
  {
    code: 1,
    data: {
      hasMore: false,
      logs: [{
        content: '[Battle] Mock operation completed.',
        id: 1,
        logLevel: 1,
        name: MOCK_ACCOUNTS[0],
        ts: 1_700_000_100,
      }],
    },
    message: 'ok',
  },
);

export const mockArkHostGachaEvents = [
  v.parse(arkHostGachaEventSchema, {
    account: MOCK_ACCOUNTS[0],
    avatar: { id: 'avatar_def_01', type: 'DEFAULT' },
    charId: 'char_002_amiya',
    createdAt: 1_700_000_200,
    gachaInfo: 'Mock banner pull',
    nickName: 'Mock Doctor 1',
  }),
];
