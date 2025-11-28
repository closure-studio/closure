import { IGameData } from "./arkHost.js";
import { IAssetItems, IAssetStages } from "./assets.js";
import { IAuthSession, UUID } from "./auth.js";
import { IServiceConfigs } from "./axios.js";

export interface IAPIConfigs {
  serviceConfigs: IServiceConfigs;
}

export interface IAPPStates {
  apiConfigs: IAPIConfigs;
  // null 表示登出状态
  currentCredentialUUID: UUID | null;
  // 登陆凭证 key 是 UUID
  credentialRecord: Record<UUID, IAuthSession>;
  // 资源文件
  assetItems: IAssetItems;
  assetStages: IAssetStages;
  // 游戏信息
  gamesData: Record<UUID, IGameData[]>;
}
