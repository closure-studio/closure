import * as v from "valibot";

import {
  arkHostGameDetailSchema,
  arkHostGameDetailResponseSchema,
  arkHostGameListResponseSchema,
  arkHostGameLogsResponseSchema,
} from "@/schemas/arkhost";

import rawGameDetailResponse from './game-detail.response.json';
import secondaryTroops from './secondary-troops.json';

export const mockArkHostGameDetailResponse = v.parse(
  arkHostGameDetailResponseSchema, rawGameDetailResponse,
);
if (mockArkHostGameDetailResponse.code !== 1) throw new Error('Expected primary detail fixture.');
const primaryDetail = mockArkHostGameDetailResponse.data;

const userId = "492f6025-e5da-4ad0-9ced-de2a641816d7";
const gameConfig = (
  account: string,
  currentMap: string,
) => ({
  accelerate_slot: "slot_14",
  account,
  allow_login_assist: false,
  battle_tasks: (currentMap
    ? [
        currentMap,
        "main_01-07",
      ]
    : ["main_01-07"]
  ).map((stage_id) => ({ mode: "LOOP" as const, stage_id })),
  current_map: currentMap,
  enable_building_arrange: true,
  is_auto_battle: true,
  keeping_ap: 0,
  operator_development_tasks: [],
  recruit_ignore_robot: false,
  recruit_reserve: 0,
});
const captchaInfo = {
  account: "",
  captcha_type: "",
  challenge: "",
  created: 0,
  geetestId: "",
  gt: "",
  riskType: "",
};

export const mockArkHostGameListResponse = v.parse(
  arkHostGameListResponseSchema,
  {
    code: 1,
    data: [
      {
        captcha_info: captchaInfo,
        game_config: primaryDetail.config,
        status: {
          account: "G18928069156",
          ap: primaryDetail.status.ap,
          avatar: primaryDetail.status.avatar,
          code: 2,
          created_at: 1779612955,
          is_verify: true,
          level: primaryDetail.status.level,
          nick_name: primaryDetail.status.nickName,
          password: "******",
          platform: 1,
          uuid: userId,
        },
      },
      {
        captcha_info: captchaInfo,
        game_config: gameConfig("G16601716973", ""),
        status: {
          account: "G16601716973",
          ap: 612,
          avatar: { id: "", type: "" },
          code: 2,
          created_at: 1786544056,
          is_verify: true,
          level: 12,
          nick_name: "76t7tu",
          password: "******",
          platform: 1,
          uuid: userId,
        },
      },
      {
        captcha_info: captchaInfo,
        game_config: gameConfig("G17107372623", ""),
        status: {
          account: "G17107372623",
          ap: 2666,
          avatar: { id: "avatar_def_10", type: "DEFAULT" },
          code: 2,
          created_at: 1786544072,
          is_verify: true,
          level: 5,
          nick_name: "浊心斯卡蒂",
          password: "******",
          platform: 1,
          uuid: userId,
        },
      },
    ],
    message: "大成功!",
  },
);

// Secondary accounts are synthetic snapshots; their skill data is unavailable.
export const mockArkHostGameDetails = mockArkHostGameListResponse.code === 1
  ? mockArkHostGameListResponse.data.map((entry, index) => {
      if (index === 0) return primaryDetail;
      return v.parse(arkHostGameDetailSchema, {
        config: entry.game_config,
        building: null,
        consumable: null,
        inventory: null,
        lastFreshTs: 0,
        screenshot: null,
        status: {
          androidDiamond: 0, ap: entry.status.ap, avatar: entry.status.avatar,
          avatarId: '', diamondShard: 0, gachaTicket: 0, gold: 0,
          lastApAddTime: 0, level: entry.status.level, maxAp: entry.status.ap,
          nickName: entry.status.nick_name, recruitLicense: 0, secretary: '',
          secretarySkinId: '', socialPoint: 0, tenGachaTicket: 0,
        },
        troop: secondaryTroops[index - 1],
      });
    })
  : [];

export const mockArkHostGameLogsResponse = v.parse(
  arkHostGameLogsResponseSchema,
  {
    code: 1,
    data: {
      hasMore: true,
      logs: [
        [232297603, 1786548250, 64, "[战斗] 自动作战结束！"],
        [
          232297602,
          1786548250,
          64,
          "[幽岚v3] 计划在 2026-08-13 02:24:10 开启下次战斗。",
        ],
        [
          232297601,
          1786548250,
          32,
          "[幽岚v3] 战斗前检查未通过：玩家理智不足(5 < 21)，无法开启作战",
        ],
        [
          232297600,
          1786548250,
          64,
          "[幽岚v3] 战斗前检查未通过：玩家理智不足(5 < 21)，无法开启作战",
        ],
        [232297599, 1786548250, 1, "[战斗] 没有符合要求的理智药使用。"],
        [
          232297597,
          1786548250,
          64,
          "[幽岚v3] 战斗结束！当前剩余理智(5/210) 获得物品：1.2倍奖励[龙门币(504)] 常规掉落[凝胶(2), 沿途的点滴(42)]",
        ],
        [
          232295711,
          1786548114,
          1,
          '[幽岚v3] 战斗开启成功，进攻 "TO-8"×2次 当前剩余理智(47/210)',
        ],
        [
          232294631,
          1786548039,
          1,
          '[幽岚v3] 已提交作战任务 "TO-8"，等待返回结果 (co-440d4c33-a112-0d4c-8902-5bbb9fa4d546)',
        ],
        [
          232294630,
          1786548039,
          4,
          '[幽岚v3] 开始作战! "TO-8"，等待返回结果...',
        ],
        [
          232294615,
          1786548038,
          64,
          "[泠夭v2] 下次基建排班将在 2026-08-13 02:20:38 自动进行",
        ],
      ].map(([id, ts, logLevel, content]) => ({
        content,
        id,
        logLevel,
        name: "G18928069156",
        ts,
      })),
    },
    message: "大成功!",
  },
);

export const mockArkHostGachaEvents = [
  ["这里是国服吗", "ICON", "avatar_dyn_05", "char_1015_aglna2", 1786404941],
  ["202425", "ASSISTANT", "char_1038_whitw2#2", "char_1015_aglna2", 1786405051],
  ["Dr", "ASSISTANT", "char_2026_yu@nian#12", "char_1015_aglna2", 1786405510],
  ["羽鸣轩", "", "", "char_4235_thumpy", 1786405618],
  ["黑椒羊仔骨", "ICON", "avatar_dyn_06", "char_4010_etlchi", 1786406234],
  [
    "魔法少女芙乐艾",
    "ASSISTANT",
    "char_421_crow@summer#9",
    "char_1015_aglna2",
    1786407203,
  ],
  [
    "糯米饭团",
    "ASSISTANT",
    "char_4202_haruka@iteration#6",
    "char_1015_aglna2",
    1786407243,
  ],
  [
    "雾纱",
    "ASSISTANT",
    "char_311_mudrok@ambienceSynesthesia#2",
    "char_1015_aglna2",
    1786407378,
  ],
  ["我不曾迷惘", "ICON", "avatar_activity_MN", "char_4204_mantra", 1786407503],
  [
    "极星卫",
    "ASSISTANT",
    "char_4122_grabds@yun#3",
    "char_4228_closur",
    1786407632,
  ],
  ["hjc", "ICON", "avatar_special_80", "char_1015_aglna2", 1786479412],
  ["阮若晴", "ICON", "avatar_activity_LE", "char_4235_thumpy", 1786488678],
  ["风沐云汐", "ICON", "avatar_dyn_04", "char_4235_thumpy", 1786489290],
  ["银枪的阿灵", "ICON", "avatar_special_81", "char_4235_thumpy", 1786489446],
  ["西酞普兰", "", "", "char_4235_thumpy", 1786490325],
  ["愿倾盖如故", "ICON", "avatar_dyn_04", "char_1015_aglna2", 1786490519],
  ["我替你喝粥了", "ICON", "avatar_def_10", "char_4235_thumpy", 1786491807],
  [
    "曦叶",
    "ASSISTANT",
    "char_4058_pepe@sightseer#2",
    "char_1015_aglna2",
    1786491837,
  ],
  ["白沐淮", "ICON", "avatar_dyn_04", "char_1015_aglna2", 1786491837],
  ["逻各斯", "ICON", "avatar_dyn_06", "char_4235_thumpy", 1786492068],
  [
    "月剑风花",
    "ASSISTANT",
    "char_497_ctable@nian#9",
    "char_4235_thumpy",
    1786492126,
  ],
  ["杜冷汀", "ICON", "avatar_dyn_04", "char_1015_aglna2", 1786492336],
  ["屑屑的伊蕾娜", "ICON", "avatar_special_80", "char_4235_thumpy", 1786493147],
  ["无伦吞枣", "ASSISTANT", "char_2027_wang#1", "char_4235_thumpy", 1786493264],
  ["维什戴尔", "ICON", "avatar_dyn_05", "char_1015_aglna2", 1786493377],
  [
    "关注塔菲喵",
    "ASSISTANT",
    "char_1045_svash2#1",
    "char_4058_pepe",
    1786493850,
  ],
  ["维清", "ICON", "avatar_special_77", "char_4235_thumpy", 1786493904],
  ["尖沙咀阿花", "ICON", "avatar_special_89", "char_4235_thumpy", 1786494031],
  ["xh", "", "", "char_1015_aglna2", 1786494197],
  [
    "Dawnfight",
    "ASSISTANT",
    "char_1020_reed2@summer#17",
    "char_4026_vulpis",
    1786507198,
  ],
].map(([nickName, type, id, charId, createdAt]) =>
  v.parse(
    // Parse each event independently so malformed fixture data fails immediately.
    v.object({
      account: v.string(),
      avatar: v.object({ id: v.string(), type: v.string() }),
      charId: v.string(),
      createdAt: v.number(),
      gachaInfo: v.string(),
      nickName: v.string(),
    }),
    {
      account: "",
      avatar: { id, type },
      charId,
      createdAt,
      gachaInfo: "限定卡池“车辙与风的归所”每日一抽",
      nickName,
    },
  ),
);
