import { IDeleteGameResponse } from "@/types/arkQuota";
import { IAPIResponse } from "@/types/axios";
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
   * 注意：arkQuota 的响应格式与其他服务不同
   * 成功时返回 { available: true, results: {} }
   */
  protected async handleResponse<T>(
    promise: Promise<any>,
  ): Promise<IAPIResponse<T>> {
    try {
      const resp = await promise;
      const data = resp.data;
      // arkQuota 返回格式: { available: true, results: {} }
      // 转换为统一的 IAPIResponse 格式
      if (data && "available" in data) {
        return {
          code: data.available ? 1 : 0,
          message: data.available ? "操作成功" : "操作失败",
          data: data as T,
        };
      }
      return resp.data as IAPIResponse<T>;
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
   * @param gameUuid 游戏账号UUID (如 a6e8ca52-b6ab-40b5-80cc-d36a8c9f2b68)
   * @param recaptchaToken reCAPTCHA token
   */
  async deleteGame(
    gameUuid: string,
    recaptchaToken: string,
  ): Promise<IAPIResponse<IDeleteGameResponse>> {
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
}

export default ArkQuotaClient;
