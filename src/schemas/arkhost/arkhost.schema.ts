import * as v from "valibot";

import { nonEmptyStringSchema, nonNegativeIntegerSchema } from "@/schemas/primitives";

const integerSchema = v.pipe(v.number(), v.integer());

export const ARK_HOST_GAME_STATUS_CODE = {
  loginFailed: -1,
  notStarted: 0,
  loggingIn: 1,
  running: 2,
  gameError: 3,
} as const;

export const arkHostAvatarSchema = v.object({
  id: v.string(),
  type: v.string(),
});

export const arkHostBattleReplayActionSchema = v.object({
  action_type: v.picklist(["SHARE", "AUTO_BATTLE"]),
  stage_id: nonEmptyStringSchema,
  uuid: nonEmptyStringSchema,
});

export const arkHostGameConfigSchema = v.object({
  accelerate_slot: v.string(),
  accelerate_slot_cn: v.string(),
  account: nonEmptyStringSchema,
  allow_login_assist: v.boolean(),
  battle_maps: v.array(v.string()),
  battle_replay_actions: v.nullable(v.array(arkHostBattleReplayActionSchema)),
  enable_building_arrange: v.boolean(),
  is_auto_battle: v.boolean(),
  is_stopped: v.boolean(),
  keeping_ap: nonNegativeIntegerSchema,
  map_id: v.string(),
  recruit_ignore_robot: v.boolean(),
  recruit_reserve: nonNegativeIntegerSchema,
});

export const arkHostCaptchaInfoSchema = v.object({
  account: v.optional(v.string()),
  captcha_type: v.string(),
  challenge: v.string(),
  created: nonNegativeIntegerSchema,
  geetestId: v.string(),
  gt: v.string(),
  riskType: v.string(),
});

export const arkHostGameListEntrySchema = v.object({
  captcha_info: arkHostCaptchaInfoSchema,
  game_config: arkHostGameConfigSchema,
  status: v.object({
    account: nonEmptyStringSchema,
    ap: nonNegativeIntegerSchema,
    avatar: arkHostAvatarSchema,
    code: integerSchema,
    created_at: nonNegativeIntegerSchema,
    is_verify: v.boolean(),
    level: nonNegativeIntegerSchema,
    nick_name: v.string(),
    password: v.nullable(v.string()),
    platform: integerSchema,
    text: v.string(),
    uuid: nonEmptyStringSchema,
  }),
});

export const arkHostPlayerStatusSchema = v.object({
  androidDiamond: nonNegativeIntegerSchema,
  ap: nonNegativeIntegerSchema,
  avatar: arkHostAvatarSchema,
  avatarId: v.string(),
  diamondShard: nonNegativeIntegerSchema,
  gachaTicket: nonNegativeIntegerSchema,
  gold: nonNegativeIntegerSchema,
  lastApAddTime: nonNegativeIntegerSchema,
  level: nonNegativeIntegerSchema,
  maxAp: nonNegativeIntegerSchema,
  nickName: v.string(),
  recruitLicense: nonNegativeIntegerSchema,
  secretary: v.string(),
  secretarySkinId: v.string(),
  socialPoint: nonNegativeIntegerSchema,
  tenGachaTicket: nonNegativeIntegerSchema,
});

export const arkHostInventorySchema = v.record(
  v.pipe(v.string(), v.minLength(1)),
  nonNegativeIntegerSchema,
);

export const arkHostScreenshotSchema = v.object({
  fileName: v.array(v.string()),
  host: v.string(),
  type: integerSchema,
  url: v.string(),
  uTCTime: nonNegativeIntegerSchema,
});

export const arkHostGameDetailSchema = v.object({
  config: arkHostGameConfigSchema,
  consumable: v.nullable(v.unknown()),
  inventory: v.nullable(arkHostInventorySchema),
  lastFreshTs: nonNegativeIntegerSchema,
  screenshot: v.nullable(
    v.union([arkHostScreenshotSchema, v.array(arkHostScreenshotSchema)]),
  ),
  status: arkHostPlayerStatusSchema,
  troop: v.nullable(v.unknown()),
});

export const arkHostGameLogEntrySchema = v.object({
  content: v.string(),
  id: nonNegativeIntegerSchema,
  logLevel: nonNegativeIntegerSchema,
  name: v.string(),
  ts: nonNegativeIntegerSchema,
});

export const arkHostGameLogsSchema = v.object({
  hasMore: v.boolean(),
  logs: v.array(arkHostGameLogEntrySchema),
});

export const arkHostCharacterSchema = v.object({
  charId: nonEmptyStringSchema,
  evolvePhase: nonNegativeIntegerSchema,
  level: nonNegativeIntegerSchema,
  potentialRank: nonNegativeIntegerSchema,
});

export const arkHostCharactersSchema = v.object({
  chars: v.array(arkHostCharacterSchema),
  total: nonNegativeIntegerSchema,
});

export const arkHostGachaEventSchema = v.object({
  account: v.string(),
  avatar: arkHostAvatarSchema,
  charId: nonEmptyStringSchema,
  createdAt: nonNegativeIntegerSchema,
  gachaInfo: v.string(),
  nickName: v.string(),
});

export const arkHostSseEventSchema = v.union([
  v.object({
    data: v.array(arkHostGameListEntrySchema),
    type: v.literal('game'),
  }),
  v.object({
    data: arkHostGameLogEntrySchema,
    type: v.literal('log'),
  }),
  v.object({
    data: v.array(arkHostGachaEventSchema),
    type: v.literal('ssr'),
  }),
]);

const responseMessageSchema = v.string();
function responseSchema<
  TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(dataSchema: TSchema) {
  return v.union([
    v.object({
      code: v.literal(1),
      data: dataSchema,
      message: responseMessageSchema,
    }),
    v.object({
      code: v.literal(0),
      data: v.null_(),
      message: responseMessageSchema,
    }),
  ]);
}

export const arkHostGameListResponseSchema = responseSchema(
  v.array(arkHostGameListEntrySchema),
);
export const arkHostGameDetailResponseSchema = responseSchema(
  arkHostGameDetailSchema,
);
export const arkHostGameLogsResponseSchema = responseSchema(
  arkHostGameLogsSchema,
);
export const arkHostCharactersResponseSchema = responseSchema(
  arkHostCharactersSchema,
);

export type ArkHostAvatar = v.InferOutput<typeof arkHostAvatarSchema>;
export type ArkHostGameListEntry = v.InferOutput<
  typeof arkHostGameListEntrySchema
>;
export type ArkHostGameDetail = v.InferOutput<typeof arkHostGameDetailSchema>;
export type ArkHostGameLogs = v.InferOutput<typeof arkHostGameLogsSchema>;
export type ArkHostGameLogEntry = v.InferOutput<
  typeof arkHostGameLogEntrySchema
>;
export type ArkHostCharacter = v.InferOutput<typeof arkHostCharacterSchema>;
export type ArkHostCharacters = v.InferOutput<typeof arkHostCharactersSchema>;
export type ArkHostGachaEvent = v.InferOutput<typeof arkHostGachaEventSchema>;
export type ArkHostSseEvent = v.InferOutput<typeof arkHostSseEventSchema>;
