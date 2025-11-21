
import { IAuthLoginResponse } from "@/types/auth";
import { IApiResponse, IServiceConfig } from "@/types/axios";
import ServerBase from "./base";
import { ID_SERVER_CONSTANTS } from "./constants";
/**
 * IdServerClient
 * 
 * 负责与身份验证服务器通信
 * 只负责 API 调用和返回响应，不处理业务逻辑
 */
class IdServerClient extends ServerBase {
    constructor(config: IServiceConfig) {
        super(config);
    }

    /**
     * 处理 API 响应
     */
    protected async handleResponse<T>(promise: Promise<any>): Promise<IApiResponse<T>> {
        try {
            const resp = await promise;
            return resp.data as IApiResponse<T>;
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
    async login(email: string, password: string): Promise<IApiResponse<IAuthLoginResponse>> {
        const option = { ...ID_SERVER_CONSTANTS.LOGIN };
        option.data = { email, password };
        option.isPublic = true; // 登录接口是公开的，不需要 token
        return this.post<IAuthLoginResponse>(option.endPoint, option);
    }
}
export default IdServerClient;