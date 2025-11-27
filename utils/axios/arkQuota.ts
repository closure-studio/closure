import { IAPIResponse } from "@/types/axios.js";
import ServerBase from "./base.js";

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
  ): Promise<IAPIResponse<T>> {
    try {
      const resp = await promise;
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
}

export default ArkQuotaClient;
