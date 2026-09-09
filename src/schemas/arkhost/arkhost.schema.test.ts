import * as v from "valibot";
import rawDetail from "@/mocks/arkhost/game-detail.response.json";

import {
  mockArkHostGameDetailResponse,
  mockArkHostGameListResponse,
  mockArkHostGameLogsResponse,
} from "@/mocks/arkhost";
import {
  arkHostCharacterSchema,
  arkHostBattleTaskSchema,
  arkHostGameConfigPatchSchema,
  arkHostGameConfigSchema,
  arkHostGameDetailResponseSchema,
  arkHostGameListResponseSchema,
  arkHostGameLogsResponseSchema,
} from ".";

describe("ArkHost server contracts", () => {
  it("accepts every supplied ArkHost response fixture", () => {
    expect(
      v.safeParse(arkHostGameListResponseSchema, mockArkHostGameListResponse)
        .success,
    ).toBe(true);
    expect(
      v.safeParse(
        arkHostGameDetailResponseSchema,
        mockArkHostGameDetailResponse,
      ).success,
    ).toBe(true);
    expect(
      v.safeParse(arkHostGameLogsResponseSchema, mockArkHostGameLogsResponse)
        .success,
    ).toBe(true);

  });

  it("preserves the complete supplied detail and validates nested data", () => {
    const response = v.parse(arkHostGameDetailResponseSchema, rawDetail);
    if (response.code !== 1) throw new Error('Expected detail');
    expect(Object.keys(response.data.troop?.chars ?? {})).toHaveLength(426);
    expect(response.data.troop).toEqual(rawDetail.data.troop);
    expect(response.data.building).toEqual(rawDetail.data.building);
    expect(response.data.config.operator_development_tasks).toEqual(rawDetail.data.config.operator_development_tasks);
    expect(response.data.config).not.toHaveProperty('is_stopped');
    for (const skill of [
      { skillId: 'skill', specializeLevel: 4, unlock: true },
      { skillId: 'skill', specializeLevel: 0, unlock: 'true' },
    ]) {
      const invalid = { ...rawDetail, data: { ...rawDetail.data, troop: { chars: {
        '1': { ...rawDetail.data.troop.chars['1'], skills: [skill] },
      } } } };
      expect(v.safeParse(arkHostGameDetailResponseSchema, invalid).success).toBe(false);
    }
    expect(v.safeParse(arkHostGameDetailResponseSchema, {
      ...rawDetail, data: { ...rawDetail.data, troop: null, building: null },
    }).success).toBe(true);
    expect(v.safeParse(arkHostGameDetailResponseSchema, {
      ...rawDetail, data: { ...rawDetail.data, building: { rooms: { TRAINING: { slot_13: { completeWorkTime: 123, trainee: null } } } } },
    }).success).toBe(false);
  });

  it("strips the deprecated is_stopped config field", () => {
    if (mockArkHostGameDetailResponse.code !== 1) {
      throw new Error("Expected ArkHost game detail fixture.");
    }
    const config = v.parse(arkHostGameConfigSchema, {
      ...mockArkHostGameDetailResponse.data.config,
      is_stopped: true,
    });

    expect(config).not.toHaveProperty("is_stopped");
  });

  it("accepts the current game config task contracts", () => {
    if (mockArkHostGameDetailResponse.code !== 1) {
      throw new Error("Expected ArkHost game detail fixture.");
    }

    const config = v.parse(arkHostGameConfigSchema, {
      ...mockArkHostGameDetailResponse.data.config,
      battle_tasks: [
        { mode: "LOOP", stage_id: "main_01-07" },
        { mode: "LOOP", stage_id: "main_01-08", uuid: "" },
        { mode: "SHARE", stage_id: "main_02-01", uuid: "share-1" },
        { mode: "ADOPT", stage_id: "main_03-01", uuid: "adopt-1" },
      ],
      operator_development_tasks: [
        {
          char_id: "char_113_cqbw",
          target: {
            evolve_phase: 2,
            level: 90,
            masteries: [
              { skill_id: "skchr_cqbw_1", target_level: 3 },
            ],
            skill_level: 7,
          },
        },
      ],
    });

    expect(config.battle_tasks).toHaveLength(4);
    expect(config.operator_development_tasks).toHaveLength(1);
  });

  it("enforces battle task mode and uuid rules", () => {
    expect(
      v.safeParse(arkHostBattleTaskSchema, {
        mode: "LOOP",
        stage_id: "main_01-07",
        uuid: "unexpected",
      }).success,
    ).toBe(false);
    expect(
      v.safeParse(arkHostBattleTaskSchema, {
        mode: "SHARE",
        stage_id: "main_01-07",
        uuid: "",
      }).success,
    ).toBe(false);
    expect(
      v.safeParse(arkHostBattleTaskSchema, {
        mode: "ADOPT",
        stage_id: " ",
        uuid: "a".repeat(65),
      }).success,
    ).toBe(false);
    expect(
      v.safeParse(arkHostBattleTaskSchema, {
        mode: "AUTO_BATTLE",
        stage_id: "main_01-07",
        uuid: "record-1",
      }).success,
    ).toBe(false);
  });

  it("rejects obsolete game config shapes and strips read-only patch fields", () => {
    expect(
      v.safeParse(arkHostGameConfigSchema, {
        accelerate_slot: "slot_14",
        accelerate_slot_cn: "中层左",
        account: "G1",
        allow_login_assist: false,
        battle_maps: ["main_01-07"],
        battle_replay_actions: null,
        enable_building_arrange: true,
        is_auto_battle: true,
        keeping_ap: 0,
        map_id: "main_01-07",
        recruit_ignore_robot: false,
        recruit_reserve: 0,
      }).success,
    ).toBe(false);

    expect(
      v.parse(arkHostGameConfigPatchSchema, {
        account: "G1",
        current_map: "main_01-07",
        keeping_ap: 12,
      }),
    ).toEqual({ keeping_ap: 12 });
  });

  it("rejects malformed trust-boundary values", () => {
    expect(
      v.safeParse(arkHostGameListResponseSchema, {
        code: 1,
        data: [{ status: { ap: -1 } }],
        message: "ok",
      }).success,
    ).toBe(false);
    expect(
      v.safeParse(arkHostGameLogsResponseSchema, {
        code: 1,
        data: { hasMore: "yes", logs: [] },
        message: "ok",
      }).success,
    ).toBe(false);
    expect(
      v.safeParse(arkHostCharacterSchema, {
        charId: "char_3",
        evolvePhase: 0,
        level: 1,
        potentialRank: 6,
      }).success,
    ).toBe(false);
    expect(
      v.safeParse(arkHostCharacterSchema, {
        charId: "char_3",
        evolvePhase: 3,
        level: 1,
        potentialRank: 0,
      }).success,
    ).toBe(false);
  });
});
