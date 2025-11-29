import { IGameData, IArkHostConfig } from "@/types/arkHost";
import { IAPIResponse } from "@/types/axios";
import ServerBase from "./base";
import { ARK_HOST_CONSTANTS } from "./constants";

/**
 * ArkHostClient
 *
 * 负责与 Ark Host 服务器通信
 * 只负责 API 调用和返回响应，不处理业务逻辑
 */
class ArkHostClient extends ServerBase {
  /**
   * 处理 API 响应
   */
  protected async handleResponse<T>(
    promise: Promise<any>,
  ): Promise<IAPIResponse<T>> {
    try {
      const resp = await promise;
      return {
        code: 1,
        message: "success",
        data: resp.data as T,
      };
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
  async queryGamesStatus(): Promise<IAPIResponse<IGameData[]>> {
    const option = ARK_HOST_CONSTANTS.GAME;
    const response = await this.get<IGameData[]>(option.endPoint, option);
    return response;
  }

  /**
   * 查询配置信息
   */
  queryConfig(): Promise<IAPIResponse<IArkHostConfig>> {
    const option = ARK_HOST_CONSTANTS.CONFIG;
    return this.get<IArkHostConfig>(option.endPoint, option);
  }
}

export default ArkHostClient;
