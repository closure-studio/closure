import {
  IArkHostConfig,
  IGameConfig,
  IGameData,
  IGameDetail,
  IGameLoginResponse,
  IGameLogResponse,
  IUpdateGameConfigResponse,
} from "@/types/arkHost";
import { IAPIResp } from "@/types/axios";
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
   * 与 IdServerClient 保持一致，直接返回 API 响应
   */
  protected async handleResponse<T>(
    promise: Promise<any>,
  ): Promise<IAPIResp<T>> {
    try {
      const resp = await promise;
      return resp.data as IAPIResp<T>;
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
          code: 0,
          message: error.message || "Unknown error",
        };
      }
    }
  }

  /**
   * 查询游戏状态
   */
  async queryGamesStatus(): Promise<IAPIResp<IGameData[]>> {
    const option = ARK_HOST_CONSTANTS.GAME;
    const response = await this.get<IGameData[]>(option.endPoint, option);
    return response;
  }

  /**
   * 查询系统配置信息
   */
  async queryConfig(): Promise<IAPIResp<IArkHostConfig>> {
    const option = ARK_HOST_CONSTANTS.CONFIG;
    const response = await this.get<IArkHostConfig>(option.endPoint, option);
    return response;
  }

  /**
   * 查询单个游戏详情
   * @param gameId 游戏账号ID (如 G18928069156)
   */
  async queryGameDetail(gameId: string): Promise<IAPIResp<IGameDetail>> {
    const option = ARK_HOST_CONSTANTS.GAME_DETAIL;
    const response = await this.get<IGameDetail>(
      `${option.endPoint}/${gameId}`,
      option,
    );
    return response;
  }

  /**
   * 查询游戏日志
   * @param gameId 游戏账号ID (如 G18928069156)
   * @param page 页码 (从0开始)
   */
  async queryGameLogs(
    gameId: string,
    page: number = 0,
  ): Promise<IAPIResp<IGameLogResponse>> {
    const option = ARK_HOST_CONSTANTS.GAME_LOG;
    const response = await this.get<IGameLogResponse>(
      `${option.endPoint}/${gameId}/${page}`,
      option,
    );
    return response;
  }

  /**
   * 游戏登录（启动游戏）
   * @param gameId 游戏账号ID (如 G18928069156)
   * @param recaptchaToken reCAPTCHA token
   */
  async gameLogin(
    gameId: string,
    recaptchaToken: string,
  ): Promise<IAPIResp<IGameLoginResponse>> {
    const option = ARK_HOST_CONSTANTS.GAME_LOGIN;
    const response = await this.post<IGameLoginResponse>(
      `${option.endPoint}/${gameId}`,
      {
        ...option,
        headers: {
          token: recaptchaToken,
        },
      },
    );
    return response;
  }

  /**
   * 更新游戏配置
   * @param gameId 游戏账号ID (如 G18928069156)
   * @param config 要更新的配置项（部分更新）
   */
  async updateGameConfig(
    gameId: string,
    config: Partial<IGameConfig>,
  ): Promise<IAPIResp<IUpdateGameConfigResponse>> {
    const option = ARK_HOST_CONSTANTS.GAME_CONFIG;
    const response = await this.post<IUpdateGameConfigResponse>(
      `${option.endPoint}/${gameId}`,
      {
        ...option,
        data: { config },
      },
    );
    return response;
  }
}

export default ArkHostClient;
