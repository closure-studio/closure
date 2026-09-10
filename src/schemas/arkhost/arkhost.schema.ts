import * as v from "valibot";

import {
  nonBlankStringSchema,
  nonEmptyStringSchema,
  nonNegativeIntegerSchema,
} from "@/schemas/primitives";

const integerSchema = v.pipe(v.number(), v.integer());
const positiveIntegerSchema = v.pipe(integerSchema, v.minValue(1));

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

const arkHostAccelerateSlotSchema = v.picklist([
  "slot_5",
  "slot_6",
  "slot_7",
  "slot_14",
  "slot_15",
  "slot_16",
  "slot_24",
  "slot_25",
  "slot_26",
]);

const arkHostBattleTaskUuidSchema = v.pipe(
  nonBlankStringSchema,
  v.maxLength(64),
);

export const arkHostBattleTaskSchema = v.variant("mode", [
  v.object({
    mode: v.literal("LOOP"),
    stage_id: nonBlankStringSchema,
    uuid: v.optional(v.literal("")),
  }),
  v.object({
    mode: v.literal("SHARE"),
    stage_id: nonBlankStringSchema,
    uuid: arkHostBattleTaskUuidSchema,
  }),
  v.object({
    mode: v.literal("ADOPT"),
    stage_id: nonBlankStringSchema,
    uuid: arkHostBattleTaskUuidSchema,
  }),
]);

const arkHostOperatorMasteryTargetSchema = v.object({
  skill_id: nonBlankStringSchema,
  target_level: v.picklist([1, 2, 3]),
});

const arkHostOperatorDevelopmentTargetSchema = v.object({
  evolve_phase: v.picklist([0, 1, 2]),
  level: positiveIntegerSchema,
  masteries: v.array(arkHostOperatorMasteryTargetSchema),
  skill_level: v.picklist([1, 2, 3, 4, 5, 6, 7]),
});

const arkHostOperatorDevelopmentTaskSchema = v.object({
  char_id: nonBlankStringSchema,
  target: arkHostOperatorDevelopmentTargetSchema,
});

export const arkHostGameConfigSchema = v.object({
  accelerate_slot: arkHostAccelerateSlotSchema,
  account: nonEmptyStringSchema,
  allow_login_assist: v.boolean(),
  battle_tasks: v.array(arkHostBattleTaskSchema),
  current_map: v.string(),
  enable_building_arrange: v.boolean(),
  is_auto_battle: v.boolean(),
  keeping_ap: nonNegativeIntegerSchema,
  operator_development_tasks: v.array(
    arkHostOperatorDevelopmentTaskSchema,
  ),
  recruit_ignore_robot: v.boolean(),
  recruit_reserve: nonNegativeIntegerSchema,
});

export const arkHostGameConfigPatchSchema = v.partial(
  v.pick(arkHostGameConfigSchema, [
    "accelerate_slot",
    "battle_tasks",
    "enable_building_arrange",
    "is_auto_battle",
    "keeping_ap",
    "operator_development_tasks",
    "recruit_ignore_robot",
    "recruit_reserve",
  ]),
);

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

export const arkHostCharacterSchema = v.object({
  charId: nonEmptyStringSchema,
  evolvePhase: v.picklist([0, 1, 2]),
  level: nonNegativeIntegerSchema,
  potentialRank: v.picklist([0, 1, 2, 3, 4, 5]),
});

const arkHostTroopSkillSchema = v.object({
  skillId: nonEmptyStringSchema,
  specializeLevel: v.picklist([0, 1, 2, 3]),
  unlock: v.boolean(),
});

const arkHostTroopCharacterSchema = v.object({
  ...arkHostCharacterSchema.entries,
  currentTmpl: v.optional(nonEmptyStringSchema),
  skills: v.array(arkHostTroopSkillSchema),
});

const arkHostTroopSchema = v.object({
  chars: v.record(nonEmptyStringSchema, arkHostTroopCharacterSchema),
});

const arkHostBuildingSchema = v.object({
  rooms: v.object({
    MANUFACTURE: v.optional(v.record(nonEmptyStringSchema, v.object({
      formulaId: v.string(),
    }))),
    TRADING: v.optional(v.record(nonEmptyStringSchema, v.object({
      strategy: v.string(),
    }))),
    TRAINING: v.optional(v.record(nonEmptyStringSchema, v.object({
      completeWorkTime: v.string(),
      trainee: v.object({ charId: v.string(), skillId: v.string() }),
    }))),
  }),
});

export const arkHostGameDetailSchema = v.object({
  building: v.optional(v.nullable(arkHostBuildingSchema)),
  config: arkHostGameConfigSchema,
  consumable: v.nullable(v.unknown()),
  inventory: v.nullable(arkHostInventorySchema),
  lastFreshTs: nonNegativeIntegerSchema,
  screenshot: v.nullable(
    v.union([arkHostScreenshotSchema, v.array(arkHostScreenshotSchema)]),
  ),
  status: arkHostPlayerStatusSchema,
  troop: v.nullable(arkHostTroopSchema),
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

export type ArkHostAvatar = v.InferOutput<typeof arkHostAvatarSchema>;
export type ArkHostAccelerateSlot = v.InferOutput<
  typeof arkHostAccelerateSlotSchema
>;
export type ArkHostBattleTask = v.InferOutput<
  typeof arkHostBattleTaskSchema
>;
export type ArkHostGameConfig = v.InferOutput<typeof arkHostGameConfigSchema>;
export type ArkHostGameListEntry = v.InferOutput<
  typeof arkHostGameListEntrySchema
>;
export type ArkHostGameDetail = v.InferOutput<typeof arkHostGameDetailSchema>;
export type ArkHostGameConfigPatch = v.InferOutput<
  typeof arkHostGameConfigPatchSchema
>;
export type ArkHostGameLogs = v.InferOutput<typeof arkHostGameLogsSchema>;
export type ArkHostGameLogEntry = v.InferOutput<
  typeof arkHostGameLogEntrySchema
>;
export type ArkHostCharacter = v.InferOutput<typeof arkHostCharacterSchema>;
export type ArkHostBuilding = v.InferOutput<typeof arkHostBuildingSchema>;
export type ArkHostGachaEvent = v.InferOutput<typeof arkHostGachaEventSchema>;
export type ArkHostSseEvent = v.InferOutput<typeof arkHostSseEventSchema>;
