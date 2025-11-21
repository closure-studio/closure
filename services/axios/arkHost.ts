import { GameStatusData, IArkHostConfig } from "@/types/arkHost";
import { IApiResponse, IServiceConfig } from "@/types/axios";
import ServerBase from "./base";
import { ARK_HOST_CONSTANTS } from "./constants";


/**
 * ArkHostClient
 * 
 * 负责与 Ark Host 服务器通信
 * 只负责 API 调用和返回响应，不处理业务逻辑
 */
class ArkHostClient extends ServerBase {
    constructor(config: IServiceConfig) {
        super(config);
    }

    /**
     * 处理 API 响应
     */
    protected async handleResponse<T>(promise: Promise<any>): Promise<IApiResponse<T>> {
        try {
            const resp = await promise;
            return resp as IApiResponse<T>;
        } catch (error: any) {
            if (error.response) {
                return {
                    code: error.response.status,
                    message: error.response.data?.message || error.message,
                };
            } else if (error.request) {
                return {
                    code: 0,
                    message: "Network error",
                };
            } else {
                return {
                    code: 500,
                    message: error.message || "Unknown error",
                };
            }
        }
    }

    /**
     * 查询游戏状态
     */
    queryGamesStatus(): Promise<IApiResponse<GameStatusData[]>> {
        const option = ARK_HOST_CONSTANTS.GAME;
        return this.post<GameStatusData[]>(option.endPoint, option);
    }

    /**
     * 查询配置信息
     */
    queryConfig(): Promise<IApiResponse<IArkHostConfig>> {
        const option = ARK_HOST_CONSTANTS.CONFIG;
        return this.get<IArkHostConfig>(option.endPoint, option);
    }

}

export default ArkHostClient;