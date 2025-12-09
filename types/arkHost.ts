// 游戏平台枚举
export enum GamePlatform {
  Official = 1, // 官服
  Bilibili = 2, // B服
}

export interface IArkHostConfig {
  isUnderMaintenance: boolean;
  isDebugMode: boolean;
  announcement: string;
  allowGameLogin: boolean;
  allowGameCreate: boolean;
  allowGameUpdate: boolean;
  allowGameDelete: boolean;
  recaptchaScore: number | null;
  database: {
    apiLogBatchSize: number;
    gameLogBatchSize: number;
    gameStatBatchSize: number;
  };
  apiVersion: string | null;
}
// 头像信息接口
interface IAvatar {
  type: string;
  id: string;
}

// 账户状态接口
interface IAccountStatus {
  account: string;
  password: string;
  platform: number;
  uuid: string;
  code: number;
  text: string;
  nick_name: string;
  level: number;
  avatar: IAvatar;
  created_at: number;
  is_verify: boolean;
  ap: number;
}

// 验证码信息接口
interface ICaptchaInfo {
  challenge: string;
  gt: string;
  created: number;
  captcha_type: string;
}

// 游戏配置接口
export interface IGameConfig {
  account: string;
  accelerate_slot: string;
  accelerate_slot_cn: string;
  battle_maps: string[];
  enable_building_arrange: boolean;
  is_auto_battle: boolean;
  is_stopped: boolean;
  keeping_ap: number;
  recruit_ignore_robot: boolean;
  recruit_reserve: number;
  map_id: string;
  allow_login_assist: boolean;
}

// 更新游戏配置请求接口
export interface IUpdateGameConfigRequest {
  config: Partial<IGameConfig>;
}

// 更新游戏配置响应接口
export interface IUpdateGameConfigResponse {
  // 响应数据为 null
}

// 主接口 - 这是你缺少的根级别接口
export interface IGameData {
  status: IAccountStatus;
  captcha_info: ICaptchaInfo;
  game_config: IGameConfig;
  // 可选字段 - 游戏详情
  detail?: IGameDetail;
  // 可选字段 - 游戏日志
  logs?: IGameLogResponse;
}

// 游戏详情状态接口
interface IGameDetailStatus {
  androidDiamond: number;
  ap: number;
  avatar: IAvatar;
  avatarId: string;
  diamondShard: number;
  gachaTicket: number;
  gold: number;
  lastApAddTime: number;
  level: number;
  maxAp: number;
  nickName: string;
  recruitLicense: number;
  secretary: string;
  secretarySkinId: string;
  socialPoint: number;
  tenGachaTicket: number;
}

// 游戏详情接口
export interface IGameDetail {
  config: IGameConfig;
  consumable: unknown | null;
  inventory: unknown | null;
  lastFreshTs: number;
  screenshot: string | null;
  status: IGameDetailStatus;
  troop: unknown | null;
}

// 游戏日志条目接口
export interface IGameLog {
  id: number;
  ts: number;
  name: string;
  logLevel: number;
  content: string;
}

// 游戏日志响应接口
export interface IGameLogResponse {
  logs: IGameLog[];
  hasMore: boolean;
}

// 游戏登录响应接口
export interface IGameLoginResponse {
  // 响应数据为 null
}

// 删除游戏响应接口 (ArkQuota)
export interface IDeleteGameResponse {
  available: boolean;
  results: Record<string, unknown>;
}

// 创建游戏请求接口 (ArkQuota)
export interface ICreateGameRequest {
  account: string;
  password: string;
  platform: GamePlatform;
}

// 创建游戏响应接口 (ArkQuota)
export interface ICreateGameResponse {
  available: boolean;
  results: Record<string, unknown>;
}
