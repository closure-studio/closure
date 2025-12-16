import {
    ICreateGameRequest,
    ICreateGameResponse,
    IDeleteGameResponse,
} from "@/types/arkHost";
import { IQuotaUser } from "@/types/arkQuota";
import { IAPIResp } from "@/types/axios";
import ServerBase from "./base";
import { ARK_QUOTA_CONSTANTS } from "./constants";

/**
 * ArkQuotaClient
 *
 * 负责与 Ark Quota 服务器通信
 * 只负责 API 调用和返回响应，不处理业务逻辑
 */
class ArkQuotaClient extends ServerBase {
  /**
   * 处理 API 响应
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
          code: 500,
          message: error.message || "Unknown error",
        };
      }
    }
  }

  /**
   * 删除游戏账号
   * @param gameUuid 游戏UUID (如 a6e8ca52-b6ab-40b5-80cc-d36a8c9f2b68)
   * @param recaptchaToken reCAPTCHA token
   */
  async deleteGame(
    gameUuid: string,
    recaptchaToken: string,
  ): Promise<IAPIResp<IDeleteGameResponse>> {
    const option = ARK_QUOTA_CONSTANTS.DELETE_GAME;
    const response = await this.post<IDeleteGameResponse>(
      `${option.endPoint}?uuid=${gameUuid}`,
      {
        ...option,
        headers: {
          token: recaptchaToken,
        },
        data: { account: null },
      },
    );
    return response;
  }

  /**
   * 创建游戏账号
   * @param slotUuid 槽位UUID (如 64c38763-8cea-42c1-b6c9-8d29cc06b698)
   * @param gameData 游戏账号数据
   * @param recaptchaToken reCAPTCHA token
   */
  async createGame(
    slotUuid: string,
    gameData: ICreateGameRequest,
    recaptchaToken: string,
  ): Promise<IAPIResp<ICreateGameResponse>> {
    const option = ARK_QUOTA_CONSTANTS.CREATE_GAME;
    const response = await this.post<ICreateGameResponse>(
      `${option.endPoint}?uuid=${slotUuid}`,
      {
        ...option,
        headers: {
          token: recaptchaToken,
        },
        data: gameData,
      },
    );
    return response;
  }

  /**
   * 获取当前用户信息（含 slots）
   */
  async getCurrentUser(): Promise<IAPIResp<IQuotaUser>> {
    const option = ARK_QUOTA_CONSTANTS.USER_ME;
    const response = await this.get<IQuotaUser>(option.endPoint, option);
    return response;
  }
}

export default ArkQuotaClient;
