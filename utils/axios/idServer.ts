import {
  ILoginResponse,
  IRegisterCodeResponse,
  IRegisterRequest,
  IRegisterResponse,
  IResetPasswordRequest,
  IResetPasswordResponse,
} from "@/types/auth";
import { IAPIResponse } from "@/types/axios";
import ServerBase from "./base";
import { ID_SERVER_CONSTANTS } from "./constants";

/**
 * IdServerClient
 *
 * 负责与身份验证服务器通信
 * 只负责 API 调用和返回响应，不处理业务逻辑
 */
class IdServerClient extends ServerBase {
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
          code: 0,
          message: error.message || "Unknown error",
        };
      }
    }
  }
  /**
   * 用户登录
   * @param email 用户邮箱
   * @param password 用户密码
   * @returns 登录响应，包含 token
   */
  async login(
    email: string,
    password: string,
  ): Promise<IAPIResponse<ILoginResponse>> {
    const option = { ...ID_SERVER_CONSTANTS.LOGIN };
    option.data = { email, password };
    option.isPublic = true; // 登录接口是公开的，不需要 token
    return this.post<ILoginResponse>(option.endPoint, option);
  }

  /**
   * 发送注册验证码
   * @param email 用户邮箱
   * @returns 发送验证码响应，包含邮箱地址
   */
  async sendRegisterCode(
    email: string,
  ): Promise<IAPIResponse<IRegisterCodeResponse>> {
    const option = { ...ID_SERVER_CONSTANTS.REGISTER_CODE };
    option.data = { email };
    option.isPublic = true; // 注册验证码接口是公开的，不需要 token
    return this.post<IRegisterCodeResponse>(option.endPoint, option);
  }

  async register(
    registerData: IRegisterRequest,
  ): Promise<IAPIResponse<IRegisterResponse>> {
    try {
      const option = { ...ID_SERVER_CONSTANTS.REGISTER };
      option.data = registerData;
      option.isPublic = true; // 注册接口是公开的，不需要 token
      return this.post<IRegisterResponse>(option.endPoint, option);
    } catch (error: any) {
      return {
        code: 0,
        message: error.message || "Failed to calculate noise and sign",
      };
    }
  }

  /**
   * 重置密码
   * @param resetData 重置密码数据，包含邮箱、验证码和新密码
   * @returns 重置密码响应
   */
  async resetPassword(
    resetData: IResetPasswordRequest,
  ): Promise<IAPIResponse<IResetPasswordResponse>> {
    const option = { ...ID_SERVER_CONSTANTS.FORGET_PASSWORD };
    option.data = resetData;
    option.isPublic = true; // 重置密码接口是公开的，不需要 token
    return this.post<IResetPasswordResponse>(option.endPoint, option);
  }
}
export default IdServerClient;
