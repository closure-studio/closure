import { IAuthSession, UUID } from "./auth";
import { IServiceConfigs } from "./axios";

export interface IAPIConfigs {
    serviceConfigs: IServiceConfigs

}


export interface IAPPConfig {
    apiConfigs: IAPIConfigs;
    // null 表示登出状态
    currentCredentialUUID: UUID | null;
    // 登陆凭证 key 是 UUID
    credentialRecord: Record<UUID, IAuthSession>;
    // 资源文件
}

