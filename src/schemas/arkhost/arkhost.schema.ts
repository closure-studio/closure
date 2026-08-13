import * as v from "valibot";

const nonNegativeIntegerSchema = v.pipe(v.number(), v.integer(), v.minValue(0));
const integerSchema = v.pipe(v.number(), v.integer());
const nonBlankStringSchema = v.pipe(v.string(), v.minLength(1));

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
  stage_id: nonBlankStringSchema,
  uuid: nonBlankStringSchema,
});

export const arkHostGameConfigSchema = v.object({
  accelerate_slot: v.string(),
  accelerate_slot_cn: v.string(),
  account: nonBlankStringSchema,
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

export const arkHostGameConfigPatchSchema = v.partial(arkHostGameConfigSchema);

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
    account: nonBlankStringSchema,
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
    uuid: nonBlankStringSchema,
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
  charId: nonBlankStringSchema,
  evolvePhase: nonNegativeIntegerSchema,
  level: nonNegativeIntegerSchema,
  potentialRank: nonNegativeIntegerSchema,
});

export const arkHostCharactersSchema = v.object({
  chars: v.array(arkHostCharacterSchema),
  total: nonNegativeIntegerSchema,
});

export const arkHostApCostEntrySchema = v.object({
  account: v.string(),
  avatar: arkHostAvatarSchema,
  level: nonNegativeIntegerSchema,
  nickName: v.string(),
  totalAPCosts: nonNegativeIntegerSchema,
});

export const arkHostGachaEventSchema = v.object({
  account: v.string(),
  avatar: arkHostAvatarSchema,
  charId: nonBlankStringSchema,
  createdAt: nonNegativeIntegerSchema,
  gachaInfo: v.string(),
  nickName: v.string(),
});

const shutdownTaskConfigSchema = v.object({
  allowGameCreate: v.boolean(),
  allowGameDelete: v.boolean(),
  allowGameLogin: v.boolean(),
  allowGameUpdate: v.boolean(),
});

export const arkHostSystemConfigSchema = v.object({
  allowGameCreate: v.boolean(),
  allowGameDelete: v.boolean(),
  allowGameLogin: v.boolean(),
  allowGameUpdate: v.boolean(),
  announcement: v.string(),
  apiVersion: v.union([v.string(), v.number()]),
  captcha: v.object({ autoPassV3: v.boolean(), autoPassV4: v.boolean() }),
  database: v.object({
    apiLogBatchSize: nonNegativeIntegerSchema,
    gameLogBatchSize: nonNegativeIntegerSchema,
    gameStatBatchSize: nonNegativeIntegerSchema,
  }),
  isDebugMode: v.boolean(),
  isUnderMaintenance: v.boolean(),
  recaptchaScore: v.nullable(v.number()),
  shutdownTasks: v.array(
    v.object({
      config: shutdownTaskConfigSchema,
      timestamp: nonNegativeIntegerSchema,
    }),
  ),
});

export const arkHostSystemConfigPatchSchema = v.partial(
  v.pick(arkHostSystemConfigSchema, [
    "allowGameCreate",
    "allowGameDelete",
    "allowGameLogin",
    "allowGameUpdate",
    "announcement",
    "shutdownTasks",
  ]),
);

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

export const arkHostSystemConfigResponseSchema = responseSchema(
  arkHostSystemConfigSchema,
);
export const arkHostGameListResponseSchema = responseSchema(
  v.array(arkHostGameListEntrySchema),
);
export const arkHostGameDetailResponseSchema = responseSchema(
  arkHostGameDetailSchema,
);
export const arkHostGameLogsResponseSchema = responseSchema(
  arkHostGameLogsSchema,
);
export const arkHostApCostResponseSchema = responseSchema(
  v.array(arkHostApCostEntrySchema),
);
export const arkHostEmptyResponseSchema = responseSchema(v.null_());

export const arkHostCharactersResponseSchema = responseSchema(
  arkHostCharactersSchema,
);

export const arkHostCaptchaSubmissionSchema = v.record(
  nonBlankStringSchema,
  v.union([v.string(), v.number(), v.boolean()]),
);

export type ArkHostAvatar = v.InferOutput<typeof arkHostAvatarSchema>;
export type ArkHostGameConfig = v.InferOutput<typeof arkHostGameConfigSchema>;
export type ArkHostGameConfigPatch = v.InferOutput<
  typeof arkHostGameConfigPatchSchema
>;
export type ArkHostCaptchaInfo = v.InferOutput<typeof arkHostCaptchaInfoSchema>;
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
export type ArkHostApCostEntry = v.InferOutput<typeof arkHostApCostEntrySchema>;
export type ArkHostGachaEvent = v.InferOutput<typeof arkHostGachaEventSchema>;
export type ArkHostSystemConfig = v.InferOutput<
  typeof arkHostSystemConfigSchema
>;
export type ArkHostSystemConfigPatch = v.InferOutput<
  typeof arkHostSystemConfigPatchSchema
>;
export type ArkHostCaptchaSubmission = v.InferOutput<
  typeof arkHostCaptchaSubmissionSchema
>;
