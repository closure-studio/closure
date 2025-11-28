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
interface IGameConfig {
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

// 主接口 - 这是你缺少的根级别接口
export interface IGameData {
  status: IAccountStatus;
  captcha_info: ICaptchaInfo;
  game_config: IGameConfig;
}
