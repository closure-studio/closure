import { IAssetItems, IAssetStages } from "@/types/assets";
import { IAPIResponse } from "@/types/axios";
import ServerBase from "./base";
import { ASSETS_CONSTANTS } from "./constants";

/**
 * assetsClient
 *
 * 负责获取assets数据
 */
class AssetsClient extends ServerBase {
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
          data: undefined,
        };
      } else if (error.request) {
        return {
          code: 0,
          message: "Network error",
          data: undefined,
        };
      } else {
        return {
          code: 0,
          message: error.message || "Unknown error",
          data: undefined,
        };
      }
    }
  }

  /**
   * 获取items数据
   * @returns items响应
   */
  async getItems(): Promise<IAPIResponse<IAssetItems>> {
    const option = { ...ASSETS_CONSTANTS.ITEMS };
    return this.get<IAssetItems>(option.endPoint, option);
  }

  /**
   * 获取stages数据
   * @returns stages响应
   */
  async getStages(): Promise<IAPIResponse<IAssetStages>> {
    const option = { ...ASSETS_CONSTANTS.STAGES };
    return this.get<IAssetStages>(option.endPoint, option);
  }
}

export default AssetsClient;
